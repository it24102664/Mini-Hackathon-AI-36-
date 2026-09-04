using System.ComponentModel.DataAnnotations;

namespace HealthBridge.Api.DTOs.Order;

public class UpdateOrderStatusRequest
{
    [Required]
    public string Status { get; set; } = string.Empty;

    public string? PharmacistNotes { get; set; }
}

public class ReviewPrescriptionRequest
{
    [Required]
    public bool IsApproved { get; set; }

    public string? PharmacistNotes { get; set; }
}
