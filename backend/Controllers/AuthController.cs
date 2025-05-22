using System.ComponentModel.DataAnnotations;
using LegalMatters.Data;
using LegalMatters.Models;
using LegalMatters.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace LegalMatters.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;

    public AuthController(UserManager<User> userManager, SignInManager<User> signInManager)
    {
        _userManager = userManager;
        _signInManager = signInManager;
    }

    /// <summary>
    /// Create a new user account
    /// </summary>
    /// <remarks>
    /// Uses Cookie Based Authentication
    /// </remarks>
    /// <param name="request">User signup information</param>
    /// <returns>Success message or error</returns>
    [HttpPost("signup")]
    [ProducesResponseType(typeof(SuccessResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<SuccessResponse>> SignUp([FromBody] SignupRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var user = new User
        {
            UserName = request.Email,
            Email = request.Email,
            FirmName = request.FirmName,
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            ModelState.AddModelError(
                "User",
                string.Join(",", result.Errors.Select(e => e.Description))
            );

            return BadRequest(ModelState);
        }

        // Assign the lawyer role to all users on signup
        var roleResult = await _userManager.AddToRoleAsync(user, Roles.Lawyer);
        if (!roleResult.Succeeded)
        {
            ModelState.AddModelError(
                "Role",
                string.Join(",", roleResult.Errors.Select(e => e.Description))
            );
            return BadRequest(ModelState);
        }

        return Ok(new SuccessResponse { Message = "User created successfully" });
    }

    /// <summary>
    /// Login with email and password
    /// </summary>
    /// <example>
    ///     POST /api/auth/login
    ///     {
    ///        "email": "user@example.com",
    ///        "password": "password123"
    ///     }
    /// </example>
    /// <remarks>
    /// Uses Cookie Based Authentication
    /// </remarks>
    /// <param name="request">Login credentials</param>
    /// <returns>Success message or error</returns>
    [HttpPost("login")]
    [ProducesResponseType(typeof(SuccessResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<SuccessResponse>> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _signInManager.PasswordSignInAsync(
            request.Email,
            request.Password,
            isPersistent: true,
            lockoutOnFailure: false
        );

        if (!result.Succeeded)
        {
            return Unauthorized(new ErrorResponse { Message = "Invalid email or password" });
        }

        return Ok(new SuccessResponse { Message = "Login successful" });
    }

    /// <summary>
    /// Get current authenticated user information
    /// </summary>
    /// <returns>User information</returns>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<UserResponse>> GetCurrentUser()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized(new ErrorResponse { Message = "Not authenticated" });
        }

        // Get user roles and determine if admin or lawyer
        var roles = await _userManager.GetRolesAsync(user);
        var roleEnum = roles.Contains(Roles.Admin) ? RoleEnum.Admin : RoleEnum.Lawyer;

        return Ok(
            new UserResponse
            {
                Id = user.Id,
                Email = user.Email,
                FirmName = user.FirmName,
                Role = roleEnum,
            }
        );
    }

    /// <summary>
    /// Logout the current user
    /// </summary>
    ///
    /// <remarks>
    /// Resets the browser cookies and clears Database session
    /// </remarks>
    /// <returns>Success message</returns>
    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(typeof(SuccessResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<SuccessResponse>> Logout()
    {
        await _signInManager.SignOutAsync();
        return Ok(new SuccessResponse { Message = "Logged out successfully" });
    }
}

public record SignupRequest
{
    [Required]
    [EmailAddress]
    public required string Email { get; set; }

    [Required]
    [MinLength(6)]
    public required string Password { get; set; }

    [Required]
    public required string FirmName { get; set; }
}

public record LoginRequest
{
    [Required]
    [EmailAddress]
    /// <example>user@example.com</example>
    public required string Email { get; set; }

    [Required]
    /// <example>password123</example>
    public required string Password { get; set; }
}

public record UserResponse
{
    public int Id { get; set; }
    public required string Email { get; set; }
    public required string FirmName { get; set; }
    public required RoleEnum Role { get; set; }
}
