using System.ComponentModel.DataAnnotations;
using LegalMatters.Data;
using LegalMatters.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LegalMatters.Controllers;

[ApiController]
[Route("api/customers/{customerId}/matters")]
[Authorize]
public class MattersController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<User> _userManager;

    public MattersController(ApplicationDbContext context, UserManager<User> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    /// <summary>
    /// Retrieve matters for a customer
    /// </summary>
    /// <param name="customerId">ID of the customer</param>
    /// <returns>List of matters for the customer</returns>
    [HttpGet]
    public async Task<IActionResult> GetMatters(int customerId)
    {
        // Validate permissions first
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized(new { message = "Not authenticated" });
        }

        // Check if customer exists
        var customer = await _context.Customers.FindAsync(customerId);
        if (customer == null)
        {
            return NotFound(new { message = "Customer not found" });
        }

        // Check authorization - Admins can access all, lawyers only their customers
        var isAdmin = await _userManager.IsInRoleAsync(user, Roles.Admin);
        if (!isAdmin && customer.LawyerId != user.Id)
        {
            return Forbid();
        }

        // Get matters for the customer
        var matters = await _context.Matters
            .Where(m => m.CustomerId == customerId)
            .ToListAsync();

        return Ok(matters);
    }

    /// <summary>
    /// Create a new matter for a customer
    /// </summary>
    /// <param name="customerId">ID of the customer</param>
    /// <param name="request">Matter creation request</param>
    /// <returns>Created matter</returns>
    [HttpPost]
    public async Task<IActionResult> CreateMatter(int customerId, [FromBody] MatterCreateRequest request)
    {
        // Validate permissions first
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized(new { message = "Not authenticated" });
        }

        // Check if customer exists
        var customer = await _context.Customers.FindAsync(customerId);
        if (customer == null)
        {
            return NotFound(new { message = "Customer not found" });
        }

        // Check authorization - Admins can access all, lawyers only their customers
        var isAdmin = await _userManager.IsInRoleAsync(user, Roles.Admin);
        if (!isAdmin && customer.LawyerId != user.Id)
        {
            return Forbid();
        }

        // Now validate the model
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Create the matter
        var matter = new Matter
        {
            Title = request.Title,
            Description = request.Description,
            OpenDate = request.OpenDate ?? DateTime.UtcNow,
            Status = request.Status ?? MatterStatus.Open,
            CustomerId = customerId,
            Customer = customer
        };

        _context.Matters.Add(matter);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetMatter),
            new { customerId, matterId = matter.Id },
            matter
        );
    }

    /// <summary>
    /// Retrieve details of a specific matter
    /// </summary>
    /// <param name="customerId">ID of the customer</param>
    /// <param name="matterId">ID of the matter</param>
    /// <returns>Matter details</returns>
    [HttpGet("{matterId}")]
    public async Task<IActionResult> GetMatter(int customerId, int matterId)
    {
        // Validate permissions first
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized(new { message = "Not authenticated" });
        }

        // Check if customer exists
        var customer = await _context.Customers.FindAsync(customerId);
        if (customer == null)
        {
            return NotFound(new { message = "Customer not found" });
        }

        // Check authorization - Admins can access all, lawyers only their customers
        var isAdmin = await _userManager.IsInRoleAsync(user, Roles.Admin);
        if (!isAdmin && customer.LawyerId != user.Id)
        {
            return Forbid();
        }

        // Get the matter
        var matter = await _context.Matters
            .FirstOrDefaultAsync(m => m.Id == matterId && m.CustomerId == customerId);

        if (matter == null)
        {
            return NotFound(new { message = "Matter not found" });
        }

        return Ok(matter);
    }
}

public record MatterCreateRequest
{
    [Required]
    [StringLength(100)]
    public required string Title { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }

    public DateTime? OpenDate { get; set; }

    public MatterStatus? Status { get; set; }
}
