using System.ComponentModel.DataAnnotations;
using LegalMatters.Data;
using LegalMatters.Models;
using LegalMatters.Services;
using LegalMatters.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LegalMatters.Controllers;

[ApiController]
[Route("api/customers")]
[Authorize]
public class CustomerController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<User> _userManager;
    private readonly IPhoneNumberService _phoneNumberService;

    public CustomerController(
        ApplicationDbContext context,
        UserManager<User> userManager,
        IPhoneNumberService phoneNumberService
    )
    {
        _context = context;
        _userManager = userManager;
        _phoneNumberService = phoneNumberService;
    }

    /// <summary>
    /// Retrieve a list of customers
    /// </summary>
    /// <returns>List of customers</returns>
    [HttpGet]
    [ProducesResponseType(typeof(List<CustomerResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<List<CustomerResponse>>> GetCustomers()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized(new { message = "Not authenticated" });
        }

        var isAdmin = await _userManager.IsInRoleAsync(user, Roles.Admin);

        // Admins can see all customers, lawyers can only see their own customers
        var customers = isAdmin
            ? await _context.Customers.ToListAsync()
            : await _context.Customers.Where(c => c.LawyerId == user.Id).ToListAsync();

        // Get status open, counts for each customer
        var customerIds = customers.Select(c => c.Id).ToList();
        var matterCounts = await _context
            .Matters.Where(m => customerIds.Contains(m.CustomerId) && m.Status == MatterStatus.Open)
            .GroupBy(m => m.CustomerId)
            .Select(g => new { CustomerId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.CustomerId, x => x.Count);

        var response = customers
            .Select(c => new CustomerResponse
            {
                Id = c.Id,
                Name = c.Name,
                Phone = _phoneNumberService.FormatPhoneNumber(c.Phone),
                LawyerId = c.LawyerId,
                OpenMattersCount = matterCounts.ContainsKey(c.Id) ? matterCounts[c.Id] : 0,
            })
            .ToList();

        return Ok(response);
    }

    /// <summary>
    /// Create a new customer
    /// </summary>
    /// <param name="request">Customer creation request</param>
    /// <returns>Created customer</returns>
    [HttpPost]
    [ProducesResponseType(typeof(CustomerResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<CustomerResponse>> CreateCustomer(
        [FromBody] CustomerCreateRequest request
    )
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized(new { message = "Not authenticated" });
        }
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        var customer = new Customer
        {
            Name = request.Name,
            Phone = _phoneNumberService.NormalizePhoneNumber(request.Phone),
            LawyerId = user.Id,
            Lawyer = user,
        };

        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();

        var response = new CustomerResponse
        {
            Id = customer.Id,
            Name = customer.Name,
            Phone = _phoneNumberService.FormatPhoneNumber(customer.Phone),
            LawyerId = customer.LawyerId,
        };

        return CreatedAtAction(nameof(GetCustomer), new { customerId = customer.Id }, response);
    }

    /// <summary>
    /// Retrieve details of a customer
    /// </summary>
    /// <param name="customerId">ID of the customer to retrieve</param>
    /// <returns>Customer details</returns>
    [HttpGet("{customerId}")]
    [ProducesResponseType(typeof(CustomerResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CustomerResponse>> GetCustomer(int customerId)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized(new { message = "Not authenticated" });
        }

        var isAdmin = await _userManager.IsInRoleAsync(user, Roles.Admin);

        var customer = await _context
            .Customers
            .FirstOrDefaultAsync(c => c.Id == customerId);

        if (customer == null)
        {
            return NotFound(new { message = "Customer not found" });
        }

        // Check if user is authorized to view this customer
        if (!isAdmin && customer.LawyerId != user.Id)
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                new ErrorResponse { Message = "You are not authorized to view this customer" }
            );
        }

        // Get count of open matters for this customer
        var openMattersCount = await _context.Matters
            .CountAsync(m => m.CustomerId == customerId && m.Status == MatterStatus.Open);
            
        var response = new CustomerResponse
        {
            Id = customer.Id,
            Name = customer.Name,
            Phone = _phoneNumberService.FormatPhoneNumber(customer.Phone),
            LawyerId = customer.LawyerId,
            OpenMattersCount = openMattersCount
        };

        return Ok(response);
    }

    /// <summary>
    /// Update a customer
    /// </summary>
    /// <param name="customerId">ID of the customer to update</param>
    /// <param name="request">Customer update request</param>
    /// <returns>Updated customer</returns>
    [HttpPut("{customerId}")]
    [ProducesResponseType(typeof(CustomerResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CustomerResponse>> UpdateCustomer(
        int customerId,
        [FromBody] CustomerUpdateRequest request
    )
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized(new { message = "Not authenticated" });
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var isAdmin = await _userManager.IsInRoleAsync(user, Roles.Admin);

        var customer = await _context.Customers.FindAsync(customerId);
        if (customer == null)
        {
            return NotFound(new { message = "Customer not found" });
        }

        // Check if user is authorized to update this customer
        if (!isAdmin && customer.LawyerId != user.Id)
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                new ErrorResponse { Message = "You are not authorized to update this customer" }
            );
        }

        // Update customer properties
        customer.Name = request.Name;
        customer.Phone = _phoneNumberService.NormalizePhoneNumber(request.Phone);

        await _context.SaveChangesAsync();

        var response = new CustomerResponse
        {
            Id = customer.Id,
            Name = customer.Name,
            Phone = _phoneNumberService.FormatPhoneNumber(customer.Phone),
            LawyerId = customer.LawyerId,
        };

        return Ok(response);
    }

    /// <summary>
    /// Delete a customer
    /// </summary>
    /// <param name="customerId">ID of the customer to delete</param>
    /// <returns>Success message</returns>
    [HttpDelete("{customerId}")]
    [ProducesResponseType(typeof(SuccessResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SuccessResponse>> DeleteCustomer(int customerId)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized(new { message = "Not authenticated" });
        }

        var isAdmin = await _userManager.IsInRoleAsync(user, Roles.Admin);

        var customer = await _context.Customers.FindAsync(customerId);
        if (customer == null)
        {
            return NotFound(new { message = "Customer not found" });
        }

        // Check if user is authorized to delete this customer
        if (!isAdmin && customer.LawyerId != user.Id)
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                new ErrorResponse { Message = "You are not authorized to delete this customer" }
            );
        }

        _context.Customers.Remove(customer);
        await _context.SaveChangesAsync();

        return Ok(new SuccessResponse { Message = "Customer deleted successfully" });
    }
}

public record CustomerCreateRequest
{
    [Required]
    [StringLength(100)]
    public required string Name { get; set; }

    [Required]
    [StringLength(20)]
    public required string Phone { get; set; }
}

public record CustomerUpdateRequest
{
    [Required]
    [StringLength(100)]
    public required string Name { get; set; }

    [Required]
    [StringLength(20)]
    public required string Phone { get; set; }
}

public record CustomerResponse
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Phone { get; set; }
    public int LawyerId { get; set; }
    public int OpenMattersCount { get; set; }
}
