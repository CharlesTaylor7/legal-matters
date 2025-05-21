using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using LegalMatters.Models;
using LegalMatters.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LegalMatters.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Create a new user account
    /// </summary>
    /// <remarks>
    /// Sample request:
    ///
    ///     POST /api/auth/signup
    ///     {
    ///        "email": "user@example.com",
    ///        "password": "password123",
    ///        "firmName": "Legal Firm LLC"
    ///     }
    ///
    /// </remarks>
    /// <param name="request">User signup information</param>
    /// <returns>Success message or error</returns>
    [HttpPost("signup")]
    public async Task<IActionResult> SignUp([FromBody] SignupRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var success = await _authService.SignUpAsync(request.Email, request.Password, request.FirmName);
        if (!success)
        {
            return BadRequest(new { message = "Email already in use" });
        }

        return Ok(new { message = "User created successfully" });
    }

    /// <summary>
    /// Login with email and password
    /// </summary>
    /// <remarks>
    /// Sample request:
    ///
    ///     POST /api/auth/login
    ///     {
    ///        "email": "user@example.com",
    ///        "password": "password123"
    ///     }
    ///
    /// </remarks>
    /// <param name="request">Login credentials</param>
    /// <returns>Success message or error</returns>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var success = await _authService.LoginAsync(request.Email, request.Password);
        if (!success)
        {
            return Unauthorized(new { message = "Invalid email or password" });
        }

        return Ok(new { message = "Login successful" });
    }

    /// <summary>
    /// Get current authenticated user information
    /// </summary>
    /// <returns>User information</returns>
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var user = await _authService.GetCurrentUserAsync();
        if (user == null)
        {
            return Unauthorized(new { message = "Not authenticated" });
        }

        return Ok(new UserResponse
        {
            Id = user.Id,
            Email = user.Email,
            FirmName = user.FirmName
        });
    }

    /// <summary>
    /// Logout the current user
    /// </summary>
    /// <returns>Success message</returns>
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        await _authService.SignOutAsync();
        return Ok(new { message = "Logged out successfully" });
    }
}

// Request and response models
public class SignupRequest
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

public class LoginRequest
{
    [Required]
    [EmailAddress]
    public required string Email { get; set; }

    [Required]
    public required string Password { get; set; }
}

public class UserResponse
{
    public int Id { get; set; }
    public required string Email { get; set; }
    public required string FirmName { get; set; }
}
