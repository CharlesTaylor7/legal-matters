using System.ComponentModel.DataAnnotations;
using LegalMatters.Data;
using LegalMatters.Models;
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

    public CustomerController(ApplicationDbContext context, UserManager<User> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    /// <summary>
    /// Retrieve a list of customers
    /// </summary>
    /// <returns>List of customers</returns>
    [HttpGet]
    public async Task<IActionResult> GetCustomers()
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

        return Ok(customers);
    }

    /// <summary>
    /// Create a new customer
    /// </summary>
    /// <param name="request">Customer creation request</param>
    /// <returns>Created customer</returns>
    [HttpPost]
    public async Task<IActionResult> CreateCustomer([FromBody] CustomerCreateRequest request)
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
            Phone = request.Phone,
            LawyerId = user.Id,
            Lawyer = user,
        };

        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCustomer), new { customerId = customer.Id }, customer);
    }

    /// <summary>
    /// Retrieve details of a customer
    /// </summary>
    /// <param name="customerId">ID of the customer to retrieve</param>
    /// <returns>Customer details</returns>
    [HttpGet("{customerId}")]
    public async Task<IActionResult> GetCustomer(int customerId)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized(new { message = "Not authenticated" });
        }

        var isAdmin = await _userManager.IsInRoleAsync(user, Roles.Admin);

        var customer = await _context
            .Customers.Include(c => c.Matters)
            .FirstOrDefaultAsync(c => c.Id == customerId);

        if (customer == null)
        {
            return NotFound(new { message = "Customer not found" });
        }

        // Check if user is authorized to view this customer
        if (!isAdmin && customer.LawyerId != user.Id)
        {
            return Forbid();
        }

        return Ok(customer);
    }

    /// <summary>
    /// Update a customer
    /// </summary>
    /// <param name="customerId">ID of the customer to update</param>
    /// <param name="request">Customer update request</param>
    /// <returns>Updated customer</returns>
    [HttpPut("{customerId}")]
    public async Task<IActionResult> UpdateCustomer(
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
            return Forbid();
        }

        // Update customer properties
        customer.Name = request.Name;
        customer.Phone = request.Phone;

        await _context.SaveChangesAsync();

        return Ok(customer);
    }

    /// <summary>
    /// Delete a customer
    /// </summary>
    /// <param name="customerId">ID of the customer to delete</param>
    /// <returns>Success message</returns>
    [HttpDelete("{customerId}")]
    public async Task<IActionResult> DeleteCustomer(int customerId)
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
            return Forbid();
        }

        _context.Customers.Remove(customer);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Customer deleted successfully" });
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
