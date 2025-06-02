using System.ComponentModel.DataAnnotations;
using LegalMatters.Data;
using LegalMatters.Models;
using LegalMatters.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LegalMatters.Controllers;

[ApiController]
[Route("api/customers/{customerId}/matters")]
[Authorize(Policies.AdminOrAssignedToCustomer)]
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
        // Check if customer exists
        var customer = await _context.Customers.FindAsync(customerId);
        if (customer == null)
        {
            return NotFound(new ErrorResponse { Message = "Customer not found" });
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
        // Check if customer exists
        var customer = await _context.Customers.FindAsync(customerId);
        if (customer == null)
        {
            return NotFound(new ErrorResponse { Message = "Customer not found" });
        }

        // Validate the model
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Create the matter
        var matter = new Matter
        {
            Title = request.Title,
            Description = request.Description,
            OpenDate = DateTime.UtcNow,
            Status = MatterStatus.Open,
            CustomerId = customerId,
            Customer = customer,
        };

        _context.Matters.Add(matter);
        await _context.SaveChangesAsync();

        var response = new MatterResponse
        {
            Id = matter.Id,
            Title = matter.Title,
            Description = matter.Description ?? string.Empty,
            OpenDate = matter.OpenDate,
            Status = matter.Status,
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
    [ProducesResponseType(typeof(MatterResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<MatterResponse>> GetMatter(int customerId, int matterId)
    {
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

        var response = new MatterResponse
        {
            Id = matter.Id,
            Title = matter.Title,
            Description = matter.Description ?? string.Empty,
            OpenDate = matter.OpenDate,
            Status = matter.Status,
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

        // Validate the model
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Update the matter
        if (request.Title != null)
            matter.Title = request.Title;
        if (request.Description != null)
            matter.Description = request.Description;
        if (request.Status != null)
            matter.Status = request.Status.Value;

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
            Description = matter.Description ?? string.Empty,
            OpenDate = matter.OpenDate,
            Status = matter.Status,
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
    public string Description { get; set; }
}

public record MatterUpdateRequest
{
    [StringLength(100)]
    public string? Title { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }

    public MatterStatus? Status { get; set; }
}

public record MatterResponse
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public required string Description { get; set; }
    public DateTime OpenDate { get; set; }
    public required MatterStatus Status { get; set; }
}
