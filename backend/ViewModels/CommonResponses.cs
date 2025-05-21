using System.ComponentModel.DataAnnotations;

namespace LegalMatters.ViewModels;

/// <summary>
/// Standard success response with a message
/// </summary>
public record SuccessResponse
{
    /// <example>Operation completed successfully</example>
    public required string Message { get; set; }
}

/// <summary>
/// Standard error response with a message
/// </summary>
public record ErrorResponse
{
    /// <example>An error occurred</example>
    public required string Message { get; set; }
}
