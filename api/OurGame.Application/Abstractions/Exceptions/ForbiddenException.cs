namespace OurGame.Application.Abstractions.Exceptions;

/// <summary>
/// Exception thrown when a user attempts an operation they are not authorized to perform
/// </summary>
public class ForbiddenException : Exception
{
    public ForbiddenException(string message) : base(message)
    {
    }
}
