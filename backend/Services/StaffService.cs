using HealthBridge.Api.Data;
using HealthBridge.Api.DTOs.Customer;
using HealthBridge.Api.DTOs.Staff;
using HealthBridge.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HealthBridge.Api.Services;

public class StaffService : IStaffService
{
    private readonly ApplicationDbContext _context;

    public StaffService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<StaffResponse>> GetAllStaffAsync()
    {
        var staffRoles = new[] { UserRole.Admin, UserRole.Pharmacist, UserRole.Staff };

        return await _context.Users
            .AsNoTracking()
            .Where(u => staffRoles.Contains(u.Role))
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new StaffResponse
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                Role = u.Role,
                PhoneNumber = u.PhoneNumber,
                Address = u.Address,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<StaffResponse?> GetStaffByIdAsync(int id)
    {
        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null) return null;

        return new StaffResponse
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role,
            PhoneNumber = user.PhoneNumber,
            Address = user.Address,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<StaffResponse> CreateStaffAsync(CreateStaffRequest request)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var existingUser = await _context.Users
            .AnyAsync(u => u.Email.ToLower() == normalizedEmail);

        if (existingUser)
        {
            throw new InvalidOperationException("User with this email already exists.");
        }

        var validRoles = new[] { UserRole.Pharmacist, UserRole.Staff, UserRole.Admin };
        var role = validRoles.FirstOrDefault(r => r.Equals(request.Role, StringComparison.OrdinalIgnoreCase)) ?? UserRole.Pharmacist;

        var user = new User
        {
            FullName = request.FullName.Trim(),
            Email = normalizedEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = role,
            PhoneNumber = request.PhoneNumber?.Trim(),
            Address = request.Address?.Trim(),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return new StaffResponse
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role,
            PhoneNumber = user.PhoneNumber,
            Address = user.Address,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<StaffResponse?> UpdateStaffAsync(int id, UpdateStaffRequest request)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return null;

        user.FullName = request.FullName.Trim();
        user.PhoneNumber = request.PhoneNumber?.Trim();
        user.Address = request.Address?.Trim();

        if (!string.IsNullOrWhiteSpace(request.Role))
        {
            var validRoles = new[] { UserRole.Pharmacist, UserRole.Staff, UserRole.Admin };
            var role = validRoles.FirstOrDefault(r => r.Equals(request.Role, StringComparison.OrdinalIgnoreCase));
            if (role != null)
            {
                user.Role = role;
            }
        }

        await _context.SaveChangesAsync();

        return new StaffResponse
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role,
            PhoneNumber = user.PhoneNumber,
            Address = user.Address,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<bool> ToggleStaffActiveAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return false;

        user.IsActive = !user.IsActive;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<CustomerResponse>> GetAllCustomersAsync()
    {
        var customerRoles = new[] { UserRole.Customer, UserRole.Patient };

        var customers = await _context.Users
            .AsNoTracking()
            .Where(u => customerRoles.Contains(u.Role))
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync();

        var customerIds = customers.Select(c => c.Id).ToList();
        var orderCounts = await _context.Orders
            .Where(o => customerIds.Contains(o.CustomerId))
            .GroupBy(o => o.CustomerId)
            .Select(g => new { CustomerId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.CustomerId, g => g.Count);

        return customers.Select(c => new CustomerResponse
        {
            Id = c.Id,
            FullName = c.FullName,
            Email = c.Email,
            PhoneNumber = c.PhoneNumber,
            Address = c.Address,
            IsActive = c.IsActive,
            TotalOrders = orderCounts.ContainsKey(c.Id) ? orderCounts[c.Id] : 0,
            CreatedAt = c.CreatedAt
        });
    }

    public async Task<bool> ToggleCustomerActiveAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return false;

        user.IsActive = !user.IsActive;
        await _context.SaveChangesAsync();
        return true;
    }
}
