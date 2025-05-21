using System;
using System.ComponentModel.DataAnnotations;

namespace LegalMatters.Models;

public class User
{
    [Key]
    public int Id { get; set; }

    [Required]
    [EmailAddress]
    [StringLength(100)]
    public required string Email { get; set; }

    [Required]
    [StringLength(100)]
    public required string PasswordHash { get; set; }

    [Required]
    [StringLength(100)]
    public required string FirmName { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
