namespace TaxCalculator.Dtos;

/// <summary>
/// Data transfer object for tax calculation results
/// </summary>
public record TaxCalculationResultDto
{
    /// <summary>
    /// The gross annual salary in GBP
    /// </summary>
    public decimal GrossAnnualSalary { get; init; }

    /// <summary>
    /// The gross monthly salary in GBP
    /// </summary>
    public decimal GrossMonthlySalary { get; init; }

    /// <summary>
    /// The net annual salary after tax in GBP
    /// </summary>
    public decimal NetAnnualSalary { get; init; }

    /// <summary>
    /// The net monthly salary after tax in GBP
    /// </summary>
    public decimal NetMonthlySalary { get; init; }

    /// <summary>
    /// The total annual tax paid in GBP
    /// </summary>
    public decimal AnnualTaxPaid { get; init; }

    /// <summary>
    /// The total monthly tax paid in GBP
    /// </summary>
    public decimal MonthlyTaxPaid { get; init; }
}
