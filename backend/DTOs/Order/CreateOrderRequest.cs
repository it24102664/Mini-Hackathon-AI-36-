using System.ComponentModel.DataAnnotations;

namespace HealthBridge.Api.DTOs.Order;

public class OrderItemRequest
{
    [Required]
    [Range(1, int.MaxValue)]
    public int MedicineId { get; set; }

    [Required]
    [Range(1, 1000)]
    public int Quantity { get; set; }
}

public class CreateOrderRequest
{
    [Required]
    [MinLength(1, ErrorMessage = "Order must contain at least one item.")]
    public List<OrderItemRequest> Items { get; set; } = new();

    public string? PrescriptionUrl { get; set; }

    [MaxLength(250)]
    public string? ShippingAddress { get; set; }

    [MaxLength(50)]
    public string? ContactPhone { get; set; }
}
