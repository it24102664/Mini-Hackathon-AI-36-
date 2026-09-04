using HealthBridge.Api.DTOs.Customer;
using HealthBridge.Api.DTOs.Staff;

namespace HealthBridge.Api.Services;

public interface IStaffService
{
    // Staff Management
    Task<IEnumerable<StaffResponse>> GetAllStaffAsync();
    Task<StaffResponse?> GetStaffByIdAsync(int id);
    Task<StaffResponse> CreateStaffAsync(CreateStaffRequest request);
    Task<StaffResponse?> UpdateStaffAsync(int id, UpdateStaffRequest request);
    Task<bool> ToggleStaffActiveAsync(int id);

    // Customer Management
    Task<IEnumerable<CustomerResponse>> GetAllCustomersAsync();
    Task<bool> ToggleCustomerActiveAsync(int id);
}
