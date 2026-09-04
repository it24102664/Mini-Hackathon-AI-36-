namespace HealthBridge.Api.DTOs.Customer;

public class CustomerResponse
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }
    public bool IsActive { get; set; }
    public int TotalOrders { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UpdateCustomerStatusRequest
{
    public bool IsActive { get; set; }
}
