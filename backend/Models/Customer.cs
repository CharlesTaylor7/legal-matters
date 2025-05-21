using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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

    // Foreign key for the managing lawyer
    public int LawyerId { get; set; }

    // Navigation property for the managing lawyer
    [ForeignKey("LawyerId")]
    public User Lawyer { get; set; }

    // Navigation property for related matters
    public List<Matter> Matters { get; set; } = [];
}
