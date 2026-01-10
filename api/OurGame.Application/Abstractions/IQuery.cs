using MediatR;

namespace OurGame.Application.Abstractions;

/// <summary>
/// Marker interface for queries in the CQRS pattern.
/// Queries are read-only operations that return data without side effects.
/// </summary>
/// <typeparam name="TResponse">The type of response data returned by the query</typeparam>
public interface IQuery<TResponse> : IRequest<TResponse>
{
}
