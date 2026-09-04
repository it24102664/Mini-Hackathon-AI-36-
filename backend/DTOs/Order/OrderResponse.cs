namespace HealthBridge.Api.DTOs.Order;

public class OrderItemResponse
{
    public int Id { get; set; }
    public int MedicineId { get; set; }
    public string MedicineName { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal Subtotal { get; set; }
    public bool RequiresPrescription { get; set; }
}

public class OrderResponse
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? PrescriptionUrl { get; set; }
    public string PrescriptionStatus { get; set; } = string.Empty;
    public string? PharmacistNotes { get; set; }
    public string? ShippingAddress { get; set; }
    public string? ContactPhone { get; set; }
    public List<OrderItemResponse> Items { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
