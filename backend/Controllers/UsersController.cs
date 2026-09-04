using HealthBridge.Api.DTOs.Customer;
using HealthBridge.Api.DTOs.Staff;
using HealthBridge.Api.Models;
using HealthBridge.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthBridge.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[IgnoreAntiforgeryToken]
[Authorize(Roles = UserRole.Admin)]
public class UsersController : ControllerBase
{
    private readonly IStaffService _staffService;

    public UsersController(IStaffService staffService)
    {
        _staffService = staffService;
    }

    // ==========================================
    // STAFF MANAGEMENT (ADMIN ONLY)
    // ==========================================

    [HttpGet("staff")]
    public async Task<ActionResult<IEnumerable<StaffResponse>>> GetAllStaff()
    {
        var staff = await _staffService.GetAllStaffAsync();
        return Ok(staff);
    }

    [HttpGet("staff/{id:int}")]
    public async Task<ActionResult<StaffResponse>> GetStaffById(int id)
    {
        var member = await _staffService.GetStaffByIdAsync(id);
        if (member == null)
        {
            return NotFound(new { message = $"Staff member #{id} was not found." });
        }
        return Ok(member);
    }

    [HttpPost("staff")]
    public async Task<ActionResult<StaffResponse>> CreateStaff([FromBody] CreateStaffRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var member = await _staffService.CreateStaffAsync(request);
            return CreatedAtAction(nameof(GetStaffById), new { id = member.Id }, member);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPut("staff/{id:int}")]
    public async Task<ActionResult<StaffResponse>> UpdateStaff(int id, [FromBody] UpdateStaffRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var member = await _staffService.UpdateStaffAsync(id, request);
        if (member == null)
        {
            return NotFound(new { message = $"Staff member #{id} was not found." });
        }

        return Ok(member);
    }

    [HttpPut("staff/{id:int}/toggle-status")]
    public async Task<IActionResult> ToggleStaffActive(int id)
    {
        var success = await _staffService.ToggleStaffActiveAsync(id);
        if (!success)
        {
            return NotFound(new { message = $"Staff member #{id} was not found." });
        }

        return Ok(new { message = "Staff active status updated successfully." });
    }

    // ==========================================
    // CUSTOMER MANAGEMENT (ADMIN ONLY)
    // ==========================================

    [HttpGet("customers")]
    public async Task<ActionResult<IEnumerable<CustomerResponse>>> GetAllCustomers()
    {
        var customers = await _staffService.GetAllCustomersAsync();
        return Ok(customers);
    }

    [HttpPut("customers/{id:int}/toggle-status")]
    public async Task<IActionResult> ToggleCustomerActive(int id)
    {
        var success = await _staffService.ToggleCustomerActiveAsync(id);
        if (!success)
        {
            return NotFound(new { message = $"Customer #{id} was not found." });
        }

        return Ok(new { message = "Customer active status updated successfully." });
    }
}
