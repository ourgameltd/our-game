namespace OurGame.Application.Abstractions.Responses;

/// <summary>
/// Standard API response wrapper for all endpoints
/// </summary>
/// <typeparam name="T">The type of data being returned</typeparam>
public class ApiResponse<T>
{
    /// <summary>
    /// Indicates whether the request was successful
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// The response data payload
    /// </summary>
    public T? Data { get; set; }

    /// <summary>
    /// Error details if the request failed
    /// </summary>
    public ErrorResponse? Error { get; set; }

    /// <summary>
    /// HTTP status code
    /// </summary>
    public int StatusCode { get; set; }

    /// <summary>
    /// Creates a successful response
    /// </summary>
    public static ApiResponse<T> SuccessResponse(T data, int statusCode = 200)
    {
        return new ApiResponse<T>
        {
            Success = true,
            Data = data,
            StatusCode = statusCode
        };
    }

    /// <summary>
    /// Creates an error response
    /// </summary>
    public static ApiResponse<T> ErrorResponse(string message, int statusCode = 500, string? code = null)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Error = new ErrorResponse
            {
                Message = message,
                Code = code ?? $"ERROR_{statusCode}"
            },
            StatusCode = statusCode
        };
    }

    /// <summary>
    /// Creates a not found response
    /// </summary>
    public static ApiResponse<T> NotFoundResponse(string message = "Resource not found")
    {
        return ErrorResponse(message, 404, "NOT_FOUND");
    }

    /// <summary>
    /// Creates a validation error response
    /// </summary>
    public static ApiResponse<T> ValidationErrorResponse(string message, Dictionary<string, string[]>? validationErrors = null)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Error = new ErrorResponse
            {
                Message = message,
                Code = "VALIDATION_ERROR",
                ValidationErrors = validationErrors
            },
            StatusCode = 400
        };
    }
}
