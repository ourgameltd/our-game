using MediatR;
using OurGame.Persistence.Models;

namespace OurGame.Application.Tests.TestInfrastructure;

/// <summary>
/// Lightweight IMediator implementation for unit tests.
/// Handlers can be registered dynamically via Register().
/// Unregistered requests throw NotSupportedException.
/// </summary>
public sealed class TestMediator : IMediator
{
    private readonly Dictionary<Type, Func<object, CancellationToken, Task<object?>>> _handlers = new();

    /// <summary>
    /// Register a handler function for a specific request type.
    /// </summary>
    public void Register<TRequest, TResponse>(Func<TRequest, CancellationToken, Task<TResponse>> handler)
        where TRequest : IRequest<TResponse>
    {
        _handlers[typeof(TRequest)] = async (request, ct) =>
        {
            var result = await handler((TRequest)request, ct);
            return result;
        };
    }

    public async Task<TResponse> Send<TResponse>(IRequest<TResponse> request, CancellationToken cancellationToken = default)
    {
        var requestType = request.GetType();

        if (_handlers.TryGetValue(requestType, out var handler))
        {
            var result = await handler(request, cancellationToken);
            return (TResponse)result!;
        }

        throw new NotSupportedException($"No handler registered for {requestType.Name}");
    }

    public async Task<object?> Send(object request, CancellationToken cancellationToken = default)
    {
        var requestType = request.GetType();

        if (_handlers.TryGetValue(requestType, out var handler))
        {
            return await handler(request, cancellationToken);
        }

        throw new NotSupportedException($"No handler registered for {requestType.Name}");
    }

    public Task Send<TRequest>(TRequest request, CancellationToken cancellationToken = default)
        where TRequest : IRequest
        => throw new NotSupportedException($"Unsupported void request: {typeof(TRequest).Name}");

    public IAsyncEnumerable<TResponse> CreateStream<TResponse>(IStreamRequest<TResponse> request, CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public IAsyncEnumerable<object?> CreateStream(object request, CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task Publish(object notification, CancellationToken cancellationToken = default)
        => Task.CompletedTask;

    public Task Publish<TNotification>(TNotification notification, CancellationToken cancellationToken = default)
        where TNotification : INotification
        => Task.CompletedTask;
}
