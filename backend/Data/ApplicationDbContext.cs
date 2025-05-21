using Microsoft.EntityFrameworkCore;
using LegalMatters.Models;

namespace LegalMatters.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    public DbSet<Customer> Customers { get; init; }
    public DbSet<Matter> Matters { get; init; }
    public DbSet<User> Users { get; init; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure relationships
        modelBuilder.Entity<Customer>()
            .HasMany(c => c.Matters)
            .WithOne(m => m.Customer)
            .HasForeignKey(m => m.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure indexes
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // Seed demo data
        modelBuilder.Entity<Customer>().HasData(
            new Customer
            {
                Id = 1,
                Name = "Acme Corporation",
                Phone = "555-123-4567"
            },
            new Customer
            {
                Id = 2,
                Name = "Globex Industries",
                Phone = "555-987-6543"
            }
        );

        modelBuilder.Entity<Matter>().HasData(
            new Matter
            {
                Id = 1,
                CustomerId = 1,
                Title = "Corporate Restructuring",
                Description = "Assistance with corporate restructuring and legal compliance",
                OpenDate = new DateTime(2025, 1, 15),
                Status = MatterStatus.Open
            },
            new Matter
            {
                Id = 2,
                CustomerId = 1,
                Title = "Contract Review",
                Description = "Review of vendor contracts",
                OpenDate = new DateTime(2025, 2, 10),
                Status = MatterStatus.Open
            },
            new Matter
            {
                Id = 3,
                CustomerId = 2,
                Title = "Patent Application",
                Description = "Filing patent for new technology",
                OpenDate = new DateTime(2025, 3, 5),
                Status = MatterStatus.OnHold
            }
        );
    }
}
