using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace LegalMatters.Models;

public class User : IdentityUser<int>
{
    [Key]
    public override int Id { get; set; }

    [Required]
    [StringLength(100)]
    public required string FirmName { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
