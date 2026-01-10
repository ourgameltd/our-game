namespace OurGame.Application.Abstractions.Responses;

/// <summary>
/// Error details for failed API responses
/// </summary>
public class ErrorResponse
{
    /// <summary>
    /// Human-readable error message
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Machine-readable error code
    /// </summary>
    public string Code { get; set; } = string.Empty;

    /// <summary>
    /// Detailed validation errors (field name -> error messages)
    /// </summary>
    public Dictionary<string, string[]>? ValidationErrors { get; set; }

    /// <summary>
    /// Additional error details for debugging (only in development)
    /// </summary>
    public string? Details { get; set; }
}
