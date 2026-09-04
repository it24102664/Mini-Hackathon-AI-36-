using HealthBridge.Api.Data;
using HealthBridge.Api.DTOs.Order;
using HealthBridge.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HealthBridge.Api.Services;

public class OrderService : IOrderService
{
    private readonly ApplicationDbContext _context;

    public OrderService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<OrderResponse> CreateOrderAsync(int customerId, CreateOrderRequest request)
    {
        if (request.Items == null || !request.Items.Any())
        {
            throw new ArgumentException("Order must contain at least one item.");
        }

        var customer = await _context.Users.FindAsync(customerId);
        if (customer == null)
        {
            throw new KeyNotFoundException($"Customer with ID {customerId} not found.");
        }

        var medicineIds = request.Items.Select(i => i.MedicineId).Distinct().ToList();
        var medicines = await _context.Medicines
            .Where(m => medicineIds.Contains(m.Id))
            .ToDictionaryAsync(m => m.Id);

        decimal totalAmount = 0;
        bool requiresPrescription = false;
        var orderItems = new List<OrderItem>();

        foreach (var item in request.Items)
        {
            if (!medicines.TryGetValue(item.MedicineId, out var med))
            {
                throw new KeyNotFoundException($"Medicine with ID {item.MedicineId} does not exist.");
            }

            if (!med.IsActive)
            {
                throw new InvalidOperationException($"Medicine '{med.Name}' is no longer available.");
            }

            if (med.StockQuantity < item.Quantity)
            {
                throw new InvalidOperationException($"Insufficient stock for '{med.Name}'. Available: {med.StockQuantity}, Requested: {item.Quantity}.");
            }

            if (med.RequiresPrescription)
            {
                requiresPrescription = true;
            }

            var subtotal = med.Price * item.Quantity;
            totalAmount += subtotal;

            orderItems.Add(new OrderItem
            {
                MedicineId = med.Id,
                UnitPrice = med.Price,
                Quantity = item.Quantity,
                Subtotal = subtotal
            });
        }

        if (requiresPrescription && string.IsNullOrWhiteSpace(request.PrescriptionUrl))
        {
            throw new ArgumentException("This order contains prescription-required medicines. Please upload a valid prescription before placing the order.");
        }

        var order = new Order
        {
            CustomerId = customerId,
            OrderDate = DateTime.UtcNow,
            TotalAmount = totalAmount,
            Status = OrderStatus.Pending,
            PrescriptionUrl = request.PrescriptionUrl?.Trim(),
            PrescriptionStatus = requiresPrescription ? Models.PrescriptionStatus.Pending : Models.PrescriptionStatus.NotRequired,
            ShippingAddress = !string.IsNullOrWhiteSpace(request.ShippingAddress) ? request.ShippingAddress.Trim() : customer.Address,
            ContactPhone = !string.IsNullOrWhiteSpace(request.ContactPhone) ? request.ContactPhone.Trim() : customer.PhoneNumber,
            Items = orderItems,
            CreatedAt = DateTime.UtcNow
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        return (await GetOrderByIdAsync(order.Id))!;
    }

    public async Task<IEnumerable<OrderResponse>> GetOrdersAsync(string? status = null, DateTime? fromDate = null, DateTime? toDate = null, int? customerId = null)
    {
        var query = _context.Orders
            .Include(o => o.Customer)
            .Include(o => o.Items)
                .ThenInclude(i => i.Medicine)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(o => o.Status.ToLower() == status.ToLower());
        }

        if (customerId.HasValue)
        {
            query = query.Where(o => o.CustomerId == customerId.Value);
        }

        if (fromDate.HasValue)
        {
            query = query.Where(o => o.OrderDate >= fromDate.Value.ToUniversalTime());
        }

        if (toDate.HasValue)
        {
            query = query.Where(o => o.OrderDate <= toDate.Value.ToUniversalTime());
        }

        var orders = await query
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return orders.Select(MapToOrderResponse);
    }

    public async Task<IEnumerable<OrderResponse>> GetCustomerOrdersAsync(int customerId)
    {
        return await GetOrdersAsync(customerId: customerId);
    }

    public async Task<OrderResponse?> GetOrderByIdAsync(int id)
    {
        var order = await _context.Orders
            .Include(o => o.Customer)
            .Include(o => o.Items)
                .ThenInclude(i => i.Medicine)
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == id);

        return order == null ? null : MapToOrderResponse(order);
    }

    public async Task<OrderResponse?> UpdateOrderStatusAsync(int id, UpdateOrderStatusRequest request)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null) return null;

        var previousStatus = order.Status;
        var newStatus = request.Status.Trim();

        // If confirming an order that wasn't previously confirmed, decrement stock
        if (previousStatus != OrderStatus.Confirmed && previousStatus != OrderStatus.Ready && previousStatus != OrderStatus.Completed
            && (newStatus == OrderStatus.Confirmed || newStatus == OrderStatus.Ready || newStatus == OrderStatus.Completed))
        {
            foreach (var item in order.Items)
            {
                var med = await _context.Medicines.FindAsync(item.MedicineId);
                if (med != null)
                {
                    med.StockQuantity = Math.Max(0, med.StockQuantity - item.Quantity);
                    med.UpdatedAt = DateTime.UtcNow;
                }
            }
        }

        // If an order that was confirmed/ready is rejected, restore stock
        if ((previousStatus == OrderStatus.Confirmed || previousStatus == OrderStatus.Ready)
            && newStatus == OrderStatus.Rejected)
        {
            foreach (var item in order.Items)
            {
                var med = await _context.Medicines.FindAsync(item.MedicineId);
                if (med != null)
                {
                    med.StockQuantity += item.Quantity;
                    med.UpdatedAt = DateTime.UtcNow;
                }
            }
        }

        order.Status = newStatus;
        if (!string.IsNullOrWhiteSpace(request.PharmacistNotes))
        {
            order.PharmacistNotes = request.PharmacistNotes.Trim();
        }
        order.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return (await GetOrderByIdAsync(id))!;
    }

    public async Task<OrderResponse?> ReviewPrescriptionAsync(int id, ReviewPrescriptionRequest request)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null) return null;

        order.PrescriptionStatus = request.IsApproved ? Models.PrescriptionStatus.Approved : Models.PrescriptionStatus.Rejected;
        
        if (!request.IsApproved)
        {
            order.Status = OrderStatus.Rejected;
        }

        if (!string.IsNullOrWhiteSpace(request.PharmacistNotes))
        {
            order.PharmacistNotes = request.PharmacistNotes.Trim();
        }

        order.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return (await GetOrderByIdAsync(id))!;
    }

    private static OrderResponse MapToOrderResponse(Order order)
    {
        return new OrderResponse
        {
            Id = order.Id,
            CustomerId = order.CustomerId,
            CustomerName = order.Customer?.FullName ?? "Unknown Customer",
            CustomerEmail = order.Customer?.Email ?? string.Empty,
            OrderDate = order.OrderDate,
            TotalAmount = order.TotalAmount,
            Status = order.Status,
            PrescriptionUrl = order.PrescriptionUrl,
            PrescriptionStatus = order.PrescriptionStatus,
            PharmacistNotes = order.PharmacistNotes,
            ShippingAddress = order.ShippingAddress,
            ContactPhone = order.ContactPhone,
            CreatedAt = order.CreatedAt,
            UpdatedAt = order.UpdatedAt,
            Items = order.Items.Select(i => new OrderItemResponse
            {
                Id = i.Id,
                MedicineId = i.MedicineId,
                MedicineName = i.Medicine?.Name ?? $"Item #{i.MedicineId}",
                UnitPrice = i.UnitPrice,
                Quantity = i.Quantity,
                Subtotal = i.Subtotal,
                RequiresPrescription = i.Medicine?.RequiresPrescription ?? false
            }).ToList()
        };
    }
}
