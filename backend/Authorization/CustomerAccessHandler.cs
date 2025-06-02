using LegalMatters.Data;
using LegalMatters.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace LegalMatters.Authorization;

public class CustomerAccessRequirement : IAuthorizationRequirement { }

public class CustomerAccessHandler : AuthorizationHandler<CustomerAccessRequirement>
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<User> _userManager;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CustomerAccessHandler(
        ApplicationDbContext context,
        UserManager<User> userManager,
        IHttpContextAccessor httpContextAccessor
    )
    {
        _context = context;
        _userManager = userManager;
        _httpContextAccessor = httpContextAccessor;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        CustomerAccessRequirement requirement
    )
    {
        var user = await _userManager.GetUserAsync(context.User);
        if (user == null)
        {
            return; // Not authenticated
        }

        // Check if user is admin - admins can access all customers
        if (await _userManager.IsInRoleAsync(user, Roles.Admin))
        {
            context.Succeed(requirement);
            return;
        }

        // For non-admin users, check if they're accessing their own customer
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null)
        {
            return;
        }

        // Extract customerId from route
        if (
            !httpContext.Request.RouteValues.TryGetValue("customerId", out var customerIdObj)
            || !int.TryParse(customerIdObj?.ToString(), out var customerId)
        )
        {
            return;
        }

        // Check if customer exists and belongs to this lawyer
        var customerExists = await _context.Customers.AnyAsync(c =>
            c.Id == customerId && c.LawyerId == user.Id
        );

        if (customerExists)
        {
            context.Succeed(requirement);
        }
    }
}
