namespace HealthBridge.Api.DTOs.Medicine;

public class InventoryAlertsResponse
{
    public int TotalProducts { get; set; }
    public int LowStockCount { get; set; }
    public int ExpiredCount { get; set; }
    public int ExpiringSoonCount { get; set; }
    public IEnumerable<MedicineResponse> LowStockMedicines { get; set; } = new List<MedicineResponse>();
    public IEnumerable<MedicineResponse> ExpiringMedicines { get; set; } = new List<MedicineResponse>();
}
