using MediatR;

namespace OurGame.Application.Abstractions;

/// <summary>
/// Marker interface for commands in the CQRS pattern.
/// Commands are write operations that change state and may return a result.
/// </summary>
/// <typeparam name="TResponse">The type of response data returned by the command</typeparam>
public interface ICommand<TResponse> : IRequest<TResponse>
{
}
