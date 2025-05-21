namespace TaxCalculator.Dtos;

/// <summary>
/// Data transfer object for tax band information
/// </summary>
public record TaxBandDto
{
    /// <summary>
    /// The unique identifier for the tax band
    /// </summary>
    public required int Id { get; init; }

    /// <summary>
    /// The id of the parent rule set
    /// </summary>
    public required int TaxRuleSetId { get; init; }

    /// <summary>
    /// The name of the tax band (e.g., "Basic Rate", "Higher Rate")
    /// </summary>
    public required string Name { get; init; }

    /// <summary>
    /// The lower income threshold in GBP where this tax band starts
    /// </summary>
    public required int LowerLimit { get; init; }

    /// <summary>
    /// The tax rate percentage (e.g., 20 for 20%)
    /// </summary>
    public required int PercentageRate { get; init; }
}
