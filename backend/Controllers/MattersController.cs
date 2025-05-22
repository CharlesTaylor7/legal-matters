using System.ComponentModel.DataAnnotations;
using LegalMatters.Data;
using LegalMatters.Models;
using LegalMatters.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
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
    [ProducesResponseType(typeof(List<MatterResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<List<MatterResponse>>> GetMatters(int customerId)
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
        var matters = await _context.Matters.Where(m => m.CustomerId == customerId).ToListAsync();

        var response = matters
            .Select(m => new MatterResponse
            {
                Id = m.Id,
                Title = m.Title,
                Description = m.Description,
                OpenDate = m.OpenDate,
                Status = m.Status,
                CustomerId = m.CustomerId,
            })
            .ToList();

        return Ok(response);
    }

    /// <summary>
    /// Create a new matter for a customer
    /// </summary>
    /// <param name="customerId">ID of the customer</param>
    /// <param name="request">Matter creation request</param>
    /// <returns>Created matter</returns>
    [HttpPost]
    [ProducesResponseType(typeof(MatterResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<MatterResponse>> CreateMatter(
        int customerId,
        [FromBody] MatterCreateRequest request
    )
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
            Customer = customer,
        };

        _context.Matters.Add(matter);
        await _context.SaveChangesAsync();

        var response = new MatterResponse
        {
            Id = matter.Id,
            Title = matter.Title,
            Description = matter.Description,
            OpenDate = matter.OpenDate,
            Status = matter.Status,
            CustomerId = matter.CustomerId,
        };

        return CreatedAtAction(
            nameof(GetMatter),
            new { customerId, matterId = matter.Id },
            response
        );
    }

    /// <summary>
    /// Retrieve details of a specific matter
    /// </summary>
    /// <param name="customerId">ID of the customer</param>
    /// <param name="matterId">ID of the matter</param>
    /// <returns>Matter details</returns>
    [HttpGet("{matterId}")]
    [ProducesResponseType(typeof(MatterDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<MatterDetailResponse>> GetMatter(int customerId, int matterId)
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
        var matter = await _context.Matters.FirstOrDefaultAsync(m =>
            m.Id == matterId && m.CustomerId == customerId
        );

        if (matter == null)
        {
            return NotFound(new ErrorResponse { Message = "Matter not found" });
        }

        var response = new MatterDetailResponse
        {
            Id = matter.Id,
            Title = matter.Title,
            Description = matter.Description,
            OpenDate = matter.OpenDate,
            Status = matter.Status,
            CustomerId = matter.CustomerId,
            CustomerName = customer.Name,
        };

        return Ok(response);
    }

    /// <summary>
    /// Update an existing matter
    /// </summary>
    /// <param name="customerId">ID of the customer</param>
    /// <param name="matterId">ID of the matter to update</param>
    /// <param name="request">Matter update request</param>
    /// <returns>Updated matter</returns>
    [HttpPut("{matterId}")]
    [ProducesResponseType(typeof(MatterResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<MatterResponse>> UpdateMatter(
        int customerId,
        int matterId,
        [FromBody] MatterUpdateRequest request
    )
    {
        // Validate permissions first
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized(new ErrorResponse { Message = "Not authenticated" });
        }

        // Check if customer exists
        var customer = await _context.Customers.FindAsync(customerId);
        if (customer == null)
        {
            return NotFound(new ErrorResponse { Message = "Customer not found" });
        }

        // Check if matter exists and belongs to the customer
        var matter = await _context.Matters.FirstOrDefaultAsync(m =>
            m.Id == matterId && m.CustomerId == customerId
        );
        if (matter == null)
        {
            return NotFound(new ErrorResponse { Message = "Matter not found" });
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

        // Update the matter
        matter.Title = request.Title;
        matter.Description = request.Description;
        matter.Status = request.Status;
        matter.OpenDate = request.OpenDate ?? matter.OpenDate;

        // If status is changed to Closed, set CloseDate if not already set
        if (matter.Status == MatterStatus.Closed && matter.CloseDate == null)
        {
            matter.CloseDate = DateTime.UtcNow;
        }
        // If status is changed from Closed, clear CloseDate
        else if (matter.Status != MatterStatus.Closed)
        {
            matter.CloseDate = null;
        }

        _context.Entry(matter).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!MatterExists(matterId))
            {
                return NotFound(new ErrorResponse { Message = "Matter not found" });
            }
            else
            {
                throw;
            }
        }

        var response = new MatterResponse
        {
            Id = matter.Id,
            Title = matter.Title,
            Description = matter.Description,
            OpenDate = matter.OpenDate,
            Status = matter.Status,
            CustomerId = matter.CustomerId,
        };

        return Ok(response);
    }

    private bool MatterExists(int id)
    {
        return _context.Matters.Any(e => e.Id == id);
    }
}

public record MatterCreateRequest
{
    [Required]
    [StringLength(100)]
    public required string Title { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }

}

public record MatterUpdateRequest
{
    [Required]
    [StringLength(100)]
    public required string Title { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }

    public DateTime? OpenDate { get; set; }

    [Required]
    public required MatterStatus Status { get; set; }
}

public record MatterResponse
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public DateTime OpenDate { get; set; }
    public MatterStatus Status { get; set; }
    public int CustomerId { get; set; }
}

public record MatterDetailResponse
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public DateTime OpenDate { get; set; }
    public MatterStatus Status { get; set; }
    public int CustomerId { get; set; }
    public required string CustomerName { get; set; }
}
