namespace TaxCalculator.Models;

public class TaxRuleSet
{
    public int Id { get; set; }
    public required string Name { get; set; }

    public List<TaxBand> TaxBands { get; set; } = [];
}
