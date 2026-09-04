using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthBridge.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[IgnoreAntiforgeryToken]
[Authorize]
public class PrescriptionsController : ControllerBase
{
    private readonly IWebHostEnvironment _environment;

    public PrescriptionsController(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    /// <summary>
    /// Uploads a prescription document (image or PDF).
    /// </summary>
    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadPrescription([FromForm] IFormFile? file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "No prescription file was provided." });
        }

        if (file.Length > 10 * 1024 * 1024)
        {
            return BadRequest(new { message = "Prescription file size exceeds the 10MB limit." });
        }

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".pdf", ".webp" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

        if (!allowedExtensions.Contains(extension))
        {
            return BadRequest(new { message = "Invalid file type. Only JPG, PNG, WEBP, and PDF files are allowed." });
        }

        var uploadsFolder = Path.Combine(_environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "prescriptions");
        Directory.CreateDirectory(uploadsFolder);

        var uniqueFileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var fileUrl = $"/uploads/prescriptions/{uniqueFileName}";
        return Ok(new { url = fileUrl, fileName = file.FileName, size = file.Length });
    }
}
