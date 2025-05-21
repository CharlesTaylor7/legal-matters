using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace LegalMatters.Models;

public class Customer
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public required string Name { get; set; }

    [Required]
    [StringLength(20)]
    public required string Phone { get; set; }

    // Navigation property for related matters
    public List<Matter> Matters { get; set; } = [];
}
