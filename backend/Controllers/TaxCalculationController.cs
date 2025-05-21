using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using TaxCalculator.Dtos;
using TaxCalculator.Services;

namespace TaxCalculator.Controllers;

/// <summary>
/// Controller for tax calculation operations
/// </summary>
[ApiController]
[Route("api/tax")]
[Produces("application/json")]
public class TaxCalculationController : ControllerBase
{
    private readonly TaxCalculationService _taxCalculationService;

    public TaxCalculationController(TaxCalculationService taxCalculationService)
    {
        _taxCalculationService = taxCalculationService;
    }

    /// <summary>
    /// Calculates UK tax based on gross annual salary
    /// </summary>
    /// <param name="request">The tax calculation request containing gross annual salary</param>
    /// <returns>Tax calculation results including net salary and tax amounts</returns>
    /// <response code="200">Returns the tax calculation result</response>
    /// <response code="400">If the salary is invalid</response>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(TaxCalculationResultDto))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TaxCalculationResultDto>> CalculateTax(
        [FromQuery] TaxCalculationRequest request
    )
    {
        var result = await _taxCalculationService.CalculateTax(
            request.GrossAnnualSalary,
            request.RuleSetId
        );
        var dto = new TaxCalculationResultDto
        {
            GrossAnnualSalary = result.GrossAnnualSalary,
            GrossMonthlySalary = result.GrossMonthlySalary,
            NetAnnualSalary = result.NetAnnualSalary,
            NetMonthlySalary = result.NetMonthlySalary,
            AnnualTaxPaid = result.AnnualTaxPaid,
            MonthlyTaxPaid = result.MonthlyTaxPaid,
        };
        return Ok(dto);
    }
}

public class TaxCalculationRequest
{
    [Range(0, int.MaxValue, ErrorMessage = "Gross annual salary must be greater than zero.")]
    public int GrossAnnualSalary { get; set; }

    public int RuleSetId { get; set; } = 1;
}
