namespace OurGame.Application.Abstractions.Responses;

/// <summary>
/// Represents the result of an operation with success/failure status and optional data.
/// </summary>
/// <typeparam name="T">The type of data returned on success</typeparam>
public class Result<T>
{
    /// <summary>
    /// Indicates whether the operation was successful
    /// </summary>
    public bool IsSuccess { get; private set; }

    /// <summary>
    /// Indicates whether the operation failed due to resource not found
    /// </summary>
    public bool IsNotFound { get; private set; }

    /// <summary>
    /// Indicates whether the operation failed
    /// </summary>
    public bool IsFailure => !IsSuccess;

    /// <summary>
    /// The result data (available when IsSuccess is true)
    /// </summary>
    public T? Value { get; private set; }

    /// <summary>
    /// Error message (available when IsSuccess is false)
    /// </summary>
    public string? ErrorMessage { get; private set; }

    /// <summary>
    /// HTTP status code hint (optional)
    /// </summary>
    public int? StatusCode { get; private set; }

    private Result(bool isSuccess, T? value, string? errorMessage, bool isNotFound = false, int? statusCode = null)
    {
        IsSuccess = isSuccess;
        Value = value;
        ErrorMessage = errorMessage;
        IsNotFound = isNotFound;
        StatusCode = statusCode;
    }

    /// <summary>
    /// Creates a successful result with data
    /// </summary>
    public static Result<T> Success(T value)
    {
        return new Result<T>(true, value, null, false, 200);
    }

    /// <summary>
    /// Creates a not found result with error message
    /// </summary>
    public static Result<T> NotFound(string errorMessage)
    {
        return new Result<T>(false, default, errorMessage, true, 404);
    }

    /// <summary>
    /// Creates a failure result with error message
    /// </summary>
    public static Result<T> Failure(string errorMessage, int statusCode = 400)
    {
        return new Result<T>(false, default, errorMessage, false, statusCode);
    }
}
