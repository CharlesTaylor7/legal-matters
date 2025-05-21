namespace TaxCalculator.Dtos;

/// <summary>
/// Data transfer object for tax rule set information
/// </summary>
public record TaxRuleSetDto
{
    /// <summary>
    /// The unique identifier for the tax rule set
    /// </summary>
    public int Id { get; init; }

    /// <summary>
    /// The name of the tax rule set
    /// </summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// The collection of tax bands associated with this rule set
    /// </summary>
    public IEnumerable<TaxBandDto> TaxBands { get; init; } = [];
}
