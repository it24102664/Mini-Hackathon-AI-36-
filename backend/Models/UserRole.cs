namespace HealthBridge.Api.Models;

public static class UserRole
{
    public const string Customer = "Customer";
    public const string Patient = "Patient"; // Kept for backwards compatibility
    public const string Admin = "Admin";
    public const string Pharmacist = "Pharmacist";
    public const string Staff = "Staff";

    public static readonly IReadOnlyCollection<string> All = new[]
    {
        Customer, Patient, Admin, Pharmacist, Staff
    };
}
