using System.Security.Claims;
using HealthBridge.Api.DTOs.Order;
using HealthBridge.Api.Models;
using HealthBridge.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthBridge.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[IgnoreAntiforgeryToken]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    /// <summary>
    /// Places a new medicine order (Customer).
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<OrderResponse>> CreateOrder([FromBody] CreateOrderRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdClaim, out var customerId))
        {
            return Unauthorized(new { message = "Invalid customer credentials in token." });
        }

        try
        {
            var order = await _orderService.CreateOrderAsync(customerId, request);
            return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Gets all orders with optional filtering by status, date range, or customer (Admin, Pharmacist).
    /// </summary>
    [HttpGet]
    [Authorize(Roles = $"{UserRole.Admin},{UserRole.Pharmacist},{UserRole.Staff}")]
    public async Task<ActionResult<IEnumerable<OrderResponse>>> GetAll(
        [FromQuery] string? status = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] int? customerId = null)
    {
        var orders = await _orderService.GetOrdersAsync(status, fromDate, toDate, customerId);
        return Ok(orders);
    }

    /// <summary>
    /// Gets order history for the currently logged-in customer.
    /// </summary>
    [HttpGet("my-orders")]
    public async Task<ActionResult<IEnumerable<OrderResponse>>> GetMyOrders()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdClaim, out var customerId))
        {
            return Unauthorized(new { message = "Invalid customer credentials in token." });
        }

        var orders = await _orderService.GetCustomerOrdersAsync(customerId);
        return Ok(orders);
    }

    /// <summary>
    /// Gets order details by ID.
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<OrderResponse>> GetById(int id)
    {
        var order = await _orderService.GetOrderByIdAsync(id);
        if (order == null)
        {
            return NotFound(new { message = $"Order #{id} was not found." });
        }

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var userRole = User.FindFirstValue(ClaimTypes.Role);

        // Customers can only view their own orders; staff/admins can view any
        if (userRole == UserRole.Customer && int.TryParse(userIdClaim, out var currentUserId))
        {
            if (order.CustomerId != currentUserId)
            {
                return Forbid();
            }
        }

        return Ok(order);
    }

    /// <summary>
    /// Updates order status (Admin, Pharmacist).
    /// </summary>
    [HttpPut("{id:int}/status")]
    [Authorize(Roles = $"{UserRole.Admin},{UserRole.Pharmacist},{UserRole.Staff}")]
    public async Task<ActionResult<OrderResponse>> UpdateStatus(int id, [FromBody] UpdateOrderStatusRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var updatedOrder = await _orderService.UpdateOrderStatusAsync(id, request);
        if (updatedOrder == null)
        {
            return NotFound(new { message = $"Order #{id} was not found." });
        }

        return Ok(updatedOrder);
    }

    /// <summary>
    /// Reviews and approves/rejects an uploaded prescription for an order (Pharmacist, Admin).
    /// </summary>
    [HttpPut("{id:int}/prescription")]
    [Authorize(Roles = $"{UserRole.Admin},{UserRole.Pharmacist},{UserRole.Staff}")]
    public async Task<ActionResult<OrderResponse>> ReviewPrescription(int id, [FromBody] ReviewPrescriptionRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var updatedOrder = await _orderService.ReviewPrescriptionAsync(id, request);
        if (updatedOrder == null)
        {
            return NotFound(new { message = $"Order #{id} was not found." });
        }

        return Ok(updatedOrder);
    }
}
