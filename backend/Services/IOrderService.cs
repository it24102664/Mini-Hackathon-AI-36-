using HealthBridge.Api.DTOs.Order;

namespace HealthBridge.Api.Services;

public interface IOrderService
{
    Task<OrderResponse> CreateOrderAsync(int customerId, CreateOrderRequest request);
    Task<IEnumerable<OrderResponse>> GetOrdersAsync(string? status = null, DateTime? fromDate = null, DateTime? toDate = null, int? customerId = null);
    Task<IEnumerable<OrderResponse>> GetCustomerOrdersAsync(int customerId);
    Task<OrderResponse?> GetOrderByIdAsync(int id);
    Task<OrderResponse?> UpdateOrderStatusAsync(int id, UpdateOrderStatusRequest request);
    Task<OrderResponse?> ReviewPrescriptionAsync(int id, ReviewPrescriptionRequest request);
}
