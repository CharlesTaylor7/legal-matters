using Microsoft.EntityFrameworkCore;
using TaxCalculator.Models;

namespace TaxCalculator.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    public DbSet<TaxBand> TaxBands { get; init; }
    public DbSet<TaxRuleSet> TaxRuleSets { get; init; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // set relations
        modelBuilder.Entity<TaxRuleSet>().HasMany(t => t.TaxBands);

        modelBuilder.Entity<TaxBand>().HasOne(t => t.TaxRuleSet);

        // Seed default tax bands
        modelBuilder.Entity<TaxRuleSet>().HasData(new TaxRuleSet { Id = 1, Name = "Default" });

        modelBuilder
            .Entity<TaxBand>()
            .HasData(
                new TaxBand
                {
                    TaxRuleSetId = 1,
                    Id = 1,
                    Name = "A",
                    LowerLimit = 0,
                    PercentageRate = 0,
                },
                new TaxBand
                {
                    TaxRuleSetId = 1,
                    Id = 2,
                    Name = "B",
                    LowerLimit = 5000,
                    PercentageRate = 20,
                },
                new TaxBand
                {
                    TaxRuleSetId = 1,
                    Id = 3,
                    Name = "C",
                    LowerLimit = 20000,
                    PercentageRate = 40,
                }
            );
    }
}
