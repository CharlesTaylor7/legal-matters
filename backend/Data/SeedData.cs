using LegalMatters.Models;
using Microsoft.AspNetCore.Identity;

namespace LegalMatters.Data;

public static class LegalMattersSeedData
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        var userManager = serviceProvider.GetRequiredService<UserManager<User>>();
        var roleManager = serviceProvider.GetRequiredService<RoleManager<Role>>();

        // Ensure roles exist
        foreach (var role in Roles.All)
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new Role { Name = role });
        }

        // Ensure admin user exists
        var adminEmail = "admin@legalmatters.com";
        var adminUser = await userManager.FindByEmailAsync(adminEmail);
        if (adminUser == null)
        {
            adminUser = new User
            {
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true,
                FirmName = "Legal Matters Admin",
                CreatedAt = DateTime.UtcNow,
            };
            var adminPassword =
                Environment.GetEnvironmentVariable("ADMIN_PASSWORD")
                ?? throw new Exception("ADMIN_PASSWORD environment variable was not set!");
            await userManager.CreateAsync(adminUser, adminPassword);
            await userManager.AddToRoleAsync(adminUser, "Admin");
        }
    }
}
