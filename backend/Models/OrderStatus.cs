namespace HealthBridge.Api.Models;

public static class OrderStatus
{
    public const string Pending = "Pending";
    public const string Confirmed = "Confirmed";
    public const string Ready = "Ready";
    public const string Completed = "Completed";
    public const string Rejected = "Rejected";

    public static readonly IReadOnlyCollection<string> All = new[]
    {
        Pending, Confirmed, Ready, Completed, Rejected
    };
}
