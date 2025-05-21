using Microsoft.EntityFrameworkCore;
using TaxCalculator.Data;
using TaxCalculator.Models;

namespace TaxCalculator.Repositories;

public interface ITaxRulesRepository
{
    Task<List<TaxBand>> GetOrderedTaxBandsForRuleSetAsync(int taxRuleSetId);
    Task<IEnumerable<TaxRuleSet>> GetAllAsync();
    Task<TaxRuleSet?> GetByIdAsync(int id);
    Task<TaxRuleSet> CreateAsync(TaxRuleSet taxRuleSet);
    Task<TaxRuleSet?> UpdateAsync(int id, TaxRuleSet taxRuleSet);
    Task<bool> DeleteAsync(int id);
    Task SeedDataAsync();
    Task ResetRuleSetsAsync();

    // Tax band methods
    Task<List<TaxBand>> GetBandsByRuleSetIdAsync(int ruleSetId);
    Task<TaxBand> CreateBandAsync(int ruleSetId, TaxBand taxBand);
    Task UpdateBandAsync(TaxBand taxBand);
    Task<TaxBand?> GetBandAsync(int ruleSetId, int bandId);
    Task<bool> DeleteBandAsync(int ruleSetId, int bandId);
}

public class TaxRulesRepository : ITaxRulesRepository
{
    private readonly ApplicationDbContext _context;

    public TaxRulesRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<TaxBand>> GetOrderedTaxBandsForRuleSetAsync(int taxRuleSetId)
    {
        return await _context
            .TaxRuleSets.Where(rule => rule.Id == taxRuleSetId)
            .SelectMany(rule => rule.TaxBands)
            .OrderBy(b => b.LowerLimit)
            .ToListAsync();
    }

    public async Task<IEnumerable<TaxRuleSet>> GetAllAsync()
    {
        return await _context.TaxRuleSets.Include(x => x.TaxBands).ToListAsync();
    }

    public async Task<TaxRuleSet?> GetByIdAsync(int id)
    {
        return await _context
            .TaxRuleSets.Include(x => x.TaxBands)
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<TaxRuleSet> CreateAsync(TaxRuleSet taxRuleSet)
    {
        _context.TaxRuleSets.Add(taxRuleSet);
        await _context.SaveChangesAsync();
        return taxRuleSet;
    }

    public async Task<TaxRuleSet?> UpdateAsync(int id, TaxRuleSet taxRuleSet)
    {
        var existing = await _context.TaxRuleSets.FindAsync(id);
        if (existing == null)
            return null;

        existing.Name = taxRuleSet.Name;
        existing.TaxBands = taxRuleSet.TaxBands;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var taxRuleSet = await _context.TaxRuleSets.FindAsync(id);
        if (taxRuleSet == null)
            return false;

        _context.TaxRuleSets.Remove(taxRuleSet);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task SeedDataAsync()
    {
        // Create default tax rule set
        var defaultRuleSet = new TaxRuleSet { Id = 1, Name = "Default" };
        _context.TaxRuleSets.Add(defaultRuleSet);
        await _context.SaveChangesAsync();

        // Add default tax bands
        var taxBands = new List<TaxBand>
        {
            new TaxBand
            {
                Id = 1,
                TaxRuleSetId = defaultRuleSet.Id,
                Name = "A",
                LowerLimit = 0,
                PercentageRate = 0,
            },
            new TaxBand
            {
                Id = 2,
                TaxRuleSetId = defaultRuleSet.Id,
                Name = "B",
                LowerLimit = 5000,
                PercentageRate = 20,
            },
            new TaxBand
            {
                Id = 3,
                TaxRuleSetId = defaultRuleSet.Id,
                Name = "C",
                LowerLimit = 20000,
                PercentageRate = 40,
            },
        };

        _context.TaxBands.AddRange(taxBands);
        await _context.SaveChangesAsync();
    }

    public async Task ResetRuleSetsAsync()
    {
        // Remove all existing rule sets
        _context.TaxRuleSets.RemoveRange(_context.TaxRuleSets.ToList());
        await _context.SaveChangesAsync();

        // Seed the data again
        await SeedDataAsync();
    }

    // Tax band methods
    public async Task<List<TaxBand>> GetBandsByRuleSetIdAsync(int ruleSetId)
    {
        return await _context.TaxBands.Where(b => b.TaxRuleSetId == ruleSetId).ToListAsync();
    }

    public async Task<TaxBand> CreateBandAsync(int ruleSetId, TaxBand taxBand)
    {
        taxBand.TaxRuleSetId = ruleSetId;
        _context.TaxBands.Add(taxBand);
        await _context.SaveChangesAsync();
        return taxBand;
    }

    public async Task UpdateBandAsync(TaxBand taxBand)
    {
        var existingBand = await _context.TaxBands.FindAsync(taxBand.Id);
        if (existingBand != null)
        {
            existingBand.Name = taxBand.Name;
            existingBand.LowerLimit = taxBand.LowerLimit;
            existingBand.PercentageRate = taxBand.PercentageRate;
            await _context.SaveChangesAsync();
        }
    }

    public async Task<TaxBand?> GetBandAsync(int ruleSetId, int bandId)
    {
        return await _context.TaxBands.FirstOrDefaultAsync(b =>
            b.Id == bandId && b.TaxRuleSetId == ruleSetId
        );
    }

    public async Task<bool> DeleteBandAsync(int ruleSetId, int bandId)
    {
        var taxBand = await GetBandAsync(ruleSetId, bandId);
        if (taxBand == null)
            return false;

        _context.TaxBands.Remove(taxBand);
        await _context.SaveChangesAsync();
        return true;
    }
}
