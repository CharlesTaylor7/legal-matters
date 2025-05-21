using System;
using System.Security.Claims;
using System.Threading.Tasks;
using LegalMatters.Data;
using LegalMatters.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace LegalMatters.Services;

public class AuthService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IPasswordHasher<User> _passwordHasher;

    public AuthService(ApplicationDbContext dbContext, IHttpContextAccessor httpContextAccessor, IPasswordHasher<User> passwordHasher)
    {
        _dbContext = dbContext;
        _httpContextAccessor = httpContextAccessor;
        _passwordHasher = passwordHasher;
    }

    public async Task<User?> GetCurrentUserAsync()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null || !httpContext.User.Identity!.IsAuthenticated)
        {
            return null;
        }

        var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            return null;
        }

        return await _dbContext.Users.FindAsync(userId);
    }

    public async Task<bool> SignUpAsync(string email, string password, string firmName)
    {
        // Check if user already exists
        if (await _dbContext.Users.AnyAsync(u => u.Email == email))
        {
            return false;
        }

        // Hash password using ASP.NET Core Identity's password hasher
        var user = new User
        {
            Email = email,
            FirmName = firmName,
            PasswordHash = "" // Temporary value, will be set below
        };
        
        string passwordHash = _passwordHasher.HashPassword(user, password);

        // Set the hashed password
        user.PasswordHash = passwordHash;

        await _dbContext.Users.AddAsync(user);
        await _dbContext.SaveChangesAsync();

        // Sign in the user
        await SignInAsync(user);

        return true;
    }

    public async Task<bool> LoginAsync(string email, string password)
    {
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
        {
            return false;
        }

        // Verify password using ASP.NET Core Identity's password hasher
        var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, password);
        if (result != PasswordVerificationResult.Success)
        {
            return false;
        }

        // Sign in the user
        await SignInAsync(user);

        return true;
    }

    public async Task SignOutAsync()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext != null)
        {
            await httpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        }
    }

    private async Task SignInAsync(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim("FirmName", user.FirmName),
        };

        var claimsIdentity = new ClaimsIdentity(
            claims,
            CookieAuthenticationDefaults.AuthenticationScheme
        );

        var authProperties = new AuthenticationProperties
        {
            IsPersistent = true,
            ExpiresUtc = DateTimeOffset.UtcNow.AddDays(7),
        };

        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext != null)
        {
            await httpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(claimsIdentity),
                authProperties
            );
        }
    }
}
