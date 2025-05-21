using System;
using System.ComponentModel.DataAnnotations;

namespace TaxCalculator.Models;

public class TaxBand
{
    [Key]
    public int Id { get; set; }

    public int TaxRuleSetId { get; set; }
    public TaxRuleSet? TaxRuleSet { get; set; }

    [Required]
    [StringLength(50)]
    public required string Name { get; set; }

    [Required]
    public required int LowerLimit { get; set; }

    [Required]
    public required int PercentageRate { get; set; }
}
