namespace HealthBridge.Api.Models;

public static class PrescriptionStatus
{
    public const string NotRequired = "NotRequired";
    public const string Pending = "Pending";
    public const string Approved = "Approved";
    public const string Rejected = "Rejected";

    public static readonly IReadOnlyCollection<string> All = new[]
    {
        NotRequired, Pending, Approved, Rejected
    };
}
