using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Runtime.Serialization;
using System.Text.Json.Serialization;

namespace LegalMatters.Models;

public class Matter
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public required string Title { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }

    [Required]
    public required DateTime OpenDate { get; set; }

    public DateTime? CloseDate { get; set; }

    [Required]
    public required MatterStatus Status { get; set; } = MatterStatus.Open;

    // Foreign key for Customer
    [Required]
    public int CustomerId { get; set; }

    // Navigation property
    [ForeignKey("CustomerId")]
    public Customer? Customer { get; set; }
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum MatterStatus
{
    [EnumMember(Value = "Open")]
    Open,

    [EnumMember(Value = "Closed")]
    Closed,

    [EnumMember(Value = "OnHold")]
    OnHold,
}
