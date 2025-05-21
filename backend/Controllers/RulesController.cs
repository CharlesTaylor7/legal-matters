using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaxCalculator.Data;
using TaxCalculator.Dtos;
using TaxCalculator.Models;
using TaxCalculator.Repositories;

namespace TaxCalculator.Controllers;

[ApiController]
[Route("api/rules")]
[Produces("application/json")]
public class RulesController : ControllerBase
{
    private readonly ITaxRulesRepository _taxRulesRepository;

    public RulesController(ITaxRulesRepository taxRulesRepository)
    {
        _taxRulesRepository = taxRulesRepository;
    }

    #region Rule Sets

    /// <summary>
    /// Gets all tax rule sets
    /// </summary>
    /// <returns>All available tax rule sets</returns>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<TaxRuleSetDto>))]
    public async Task<ActionResult<IEnumerable<TaxRuleSetDto>>> GetAllSets()
    {
        var ruleSets = await _taxRulesRepository.GetAllAsync();
        var dtos = ruleSets.Select(rs => new TaxRuleSetDto
        {
            Id = rs.Id,
            Name = rs.Name,
            TaxBands = rs.TaxBands.Select(tb => new TaxBandDto
            {
                Id = tb.Id,
                TaxRuleSetId = tb.TaxRuleSetId,
                Name = tb.Name,
                LowerLimit = tb.LowerLimit,
                PercentageRate = tb.PercentageRate,
            }),
        });
        return Ok(dtos);
    }

    /// <summary>
    /// Gets a tax rule set by ID
    /// </summary>
    /// <param name="id">The ID of the tax rule set to retrieve</param>
    /// <returns>The requested tax rule set</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(TaxRuleSetDto))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TaxRuleSetDto>> GetSetById(int id)
    {
        var ruleSet = await _taxRulesRepository.GetByIdAsync(id);
        if (ruleSet == null)
            return NotFound();

        var dto = new TaxRuleSetDto
        {
            Id = ruleSet.Id,
            Name = ruleSet.Name,
            TaxBands = ruleSet.TaxBands.Select(tb => new TaxBandDto
            {
                Id = tb.Id,
                TaxRuleSetId = tb.TaxRuleSetId,
                Name = tb.Name,
                LowerLimit = tb.LowerLimit,
                PercentageRate = tb.PercentageRate,
            }),
        };
        return Ok(dto);
    }

    /// <summary>
    /// Creates a new tax rule set
    /// </summary>
    /// <param name="taxRuleSet">The tax rule set to create</param>
    /// <returns>The newly created tax rule set</returns>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(TaxRuleSetDto))]
    public async Task<ActionResult<TaxRuleSetDto>> CreateSet(TaxRuleSet taxRuleSet)
    {
        var created = await _taxRulesRepository.CreateAsync(taxRuleSet);
        var dto = new TaxRuleSetDto
        {
            Id = created.Id,
            Name = created.Name,
            TaxBands = created.TaxBands.Select(tb => new TaxBandDto
            {
                Id = tb.Id,
                TaxRuleSetId = tb.TaxRuleSetId,
                Name = tb.Name,
                LowerLimit = tb.LowerLimit,
                PercentageRate = tb.PercentageRate,
            }),
        };
        return CreatedAtAction(nameof(GetSetById), new { id = created.Id }, dto);
    }

    /// <summary>
    /// Updates an existing tax rule set
    /// </summary>
    /// <param name="id">The ID of the tax rule set to update</param>
    /// <param name="taxRuleSet">The updated tax rule set data</param>
    /// <returns>The updated tax rule set</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(TaxRuleSetDto))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TaxRuleSetDto>> UpdateSet(int id, TaxRuleSet taxRuleSet)
    {
        var updated = await _taxRulesRepository.UpdateAsync(id, taxRuleSet);
        if (updated == null)
            return NotFound();

        var dto = new TaxRuleSetDto
        {
            Id = updated.Id,
            Name = updated.Name,
            TaxBands = updated.TaxBands.Select(tb => new TaxBandDto
            {
                Id = tb.Id,
                TaxRuleSetId = tb.TaxRuleSetId,
                Name = tb.Name,
                LowerLimit = tb.LowerLimit,
                PercentageRate = tb.PercentageRate,
            }),
        };
        return Ok(dto);
    }

    /// <summary>
    /// Deletes a tax rule set
    /// </summary>
    /// <param name="id">The ID of the tax rule set to delete</param>
    /// <returns>No content if successful</returns>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteSet(int id)
    {
        var deleted = await _taxRulesRepository.DeleteAsync(id);
        if (!deleted)
            return NotFound();
        return NoContent();
    }

    /// <summary>
    /// Resets all rule sets and recreates the default one
    /// </summary>
    /// <returns>No content if successful</returns>
    [HttpPost("reset")]
    public async Task<ActionResult> ResetRuleSets()
    {
        await _taxRulesRepository.ResetRuleSetsAsync();
        return NoContent();
    }

    #endregion

    #region Tax Bands

    /// <summary>
    /// Gets all tax bands for a specific rule set
    /// </summary>
    /// <param name="ruleSetId">The ID of the rule set</param>
    /// <returns>A list of tax bands for the specified rule set</returns>
    /// <response code="200">Returns the list of tax bands for the rule set</response>
    [HttpGet("{ruleSetId}/bands")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<TaxBandDto>))]
    public async Task<ActionResult<IEnumerable<TaxBandDto>>> GetBandsByRuleSetId(int ruleSetId)
    {
        var bands = await _taxRulesRepository.GetBandsByRuleSetIdAsync(ruleSetId);

        var dtos = bands.Select(b => new TaxBandDto
        {
            Id = b.Id,
            TaxRuleSetId = b.TaxRuleSetId,
            Name = b.Name,
            LowerLimit = b.LowerLimit,
            PercentageRate = b.PercentageRate,
        });

        return Ok(dtos);
    }

    /// <summary>
    /// Creates a new tax band for a specific rule set
    /// </summary>
    /// <param name="ruleSetId">The ID of the rule set</param>
    /// <param name="taxBand">The tax band to create</param>
    /// <returns>The created tax band</returns>
    [HttpPost("{ruleSetId}/bands")]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(TaxBandDto))]
    public async Task<ActionResult<TaxBandDto>> CreateBand(
        int ruleSetId,
        [FromBody] TaxBand taxBand
    )
    {
        var createdBand = await _taxRulesRepository.CreateBandAsync(ruleSetId, taxBand);

        var dto = new TaxBandDto
        {
            Id = createdBand.Id,
            TaxRuleSetId = createdBand.TaxRuleSetId,
            Name = createdBand.Name,
            LowerLimit = createdBand.LowerLimit,
            PercentageRate = createdBand.PercentageRate,
        };

        return CreatedAtAction(nameof(GetBandsByRuleSetId), new { ruleSetId = ruleSetId }, dto);
    }

    /// <summary>
    /// Updates a specific tax band
    /// </summary>
    /// <param name="ruleSetId">The ID of the rule set</param>
    /// <param name="bandId">The ID of the tax band to update</param>
    /// <param name="taxBand">The updated tax band data</param>
    /// <returns>No content if successful</returns>
    [HttpPut("{ruleSetId}/bands/{bandId}")]
    public async Task<IActionResult> UpdateBand(int ruleSetId, int bandId, TaxBand taxBand)
    {
        if (bandId != taxBand.Id || ruleSetId != taxBand.TaxRuleSetId)
            return BadRequest();

        var existingBand = await _taxRulesRepository.GetBandAsync(ruleSetId, bandId);
        if (existingBand == null)
            return NotFound();

        await _taxRulesRepository.UpdateBandAsync(taxBand);
        return NoContent();
    }

    /// <summary>
    /// Deletes a specific tax band
    /// </summary>
    /// <param name="ruleSetId">The ID of the rule set</param>
    /// <param name="bandId">The ID of the tax band to delete</param>
    /// <returns>No content if successful</returns>
    [HttpDelete("{ruleSetId}/bands/{bandId}")]
    public async Task<IActionResult> DeleteBand(int ruleSetId, int bandId)
    {
        var success = await _taxRulesRepository.DeleteBandAsync(ruleSetId, bandId);
        if (!success)
            return NotFound();

        return NoContent();
    }

    #endregion
}
