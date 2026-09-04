using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HealthBridge.Api.Models;

public class Order
{
    public int Id { get; set; }

    public int CustomerId { get; set; }

    public User? Customer { get; set; }

    public DateTime OrderDate { get; set; } = DateTime.UtcNow;

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = OrderStatus.Pending;

    [MaxLength(500)]
    public string? PrescriptionUrl { get; set; }

    [Required]
    [MaxLength(50)]
    public string PrescriptionStatus { get; set; } = Models.PrescriptionStatus.NotRequired;

    [MaxLength(1000)]
    public string? PharmacistNotes { get; set; }

    [MaxLength(250)]
    public string? ShippingAddress { get; set; }

    [MaxLength(50)]
    public string? ContactPhone { get; set; }

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}
