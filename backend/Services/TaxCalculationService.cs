using TaxCalculator.Models;
using TaxCalculator.Repositories;

namespace TaxCalculator.Services;

public class TaxCalculationService
{
    private readonly ITaxRulesRepository _taxRulesRepository;

    public TaxCalculationService(ITaxRulesRepository taxRulesRepository)
    {
        _taxRulesRepository = taxRulesRepository;
    }

    public async Task<TaxCalculationResult> CalculateTax(int grossAnnualSalary, int taxRuleSetId)
    {
        var orderedTaxBands = await _taxRulesRepository.GetOrderedTaxBandsForRuleSetAsync(
            taxRuleSetId
        );
        return _calculateTax(orderedTaxBands, grossAnnualSalary);
    }

    private TaxCalculationResult _calculateTax(
        IReadOnlyList<TaxBand> orderedTaxBands,
        int grossAnnualSalary
    )
    {
        decimal totalTax = 0m;
        for (var i = 0; i < orderedTaxBands.Count; i++)
        {
            var currentBand = orderedTaxBands[i];

            if (grossAnnualSalary < currentBand.LowerLimit)
                break;

            // the upper limit is necessarily the lower limit of the next band
            var upperLimit =
                i == orderedTaxBands.Count - 1 ? int.MaxValue : orderedTaxBands[i + 1].LowerLimit;
            var cappedSalary = Math.Min(grossAnnualSalary, upperLimit);
            var marginalSalary = cappedSalary - currentBand.LowerLimit;

            var decimalRate = currentBand.PercentageRate / 100m;
            totalTax += marginalSalary * decimalRate;
        }

        var netAnnualSalary = grossAnnualSalary - totalTax;

        return new TaxCalculationResult
        {
            GrossAnnualSalary = grossAnnualSalary,
            GrossMonthlySalary = Math.Round(grossAnnualSalary / 12m, 2),
            NetAnnualSalary = netAnnualSalary,
            NetMonthlySalary = Math.Round(netAnnualSalary / 12m, 2),
            AnnualTaxPaid = totalTax,
            MonthlyTaxPaid = Math.Round(totalTax / 12m, 2),
        };
    }
}

public record TaxCalculationResult
{
    public decimal GrossAnnualSalary { get; init; }
    public decimal GrossMonthlySalary { get; init; }
    public decimal NetAnnualSalary { get; init; }
    public decimal NetMonthlySalary { get; init; }
    public decimal AnnualTaxPaid { get; init; }
    public decimal MonthlyTaxPaid { get; init; }
}
