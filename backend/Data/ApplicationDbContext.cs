using LegalMatters.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace LegalMatters.Data;

public class ApplicationDbContext : IdentityDbContext<User, Role, int>
{
    public DbSet<Customer> Customers { get; init; }
    public DbSet<Matter> Matters { get; init; }

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure relationships
        modelBuilder
            .Entity<Customer>()
            .HasMany(c => c.Matters)
            .WithOne(m => m.Customer)
            .HasForeignKey(m => m.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure indexes
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
    }
}
