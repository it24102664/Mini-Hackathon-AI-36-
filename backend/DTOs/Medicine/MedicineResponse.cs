namespace HealthBridge.Api.DTOs.Medicine;

public class MedicineResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public int MinStockLevel { get; set; }
    public DateTime ExpiryDate { get; set; }
    public bool RequiresPrescription { get; set; }
    public bool IsActive { get; set; }
    public bool IsLowStock => StockQuantity <= MinStockLevel;
    public bool IsExpired => ExpiryDate <= DateTime.UtcNow;
    public bool IsExpiringSoon => !IsExpired && ExpiryDate <= DateTime.UtcNow.AddDays(30);
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
