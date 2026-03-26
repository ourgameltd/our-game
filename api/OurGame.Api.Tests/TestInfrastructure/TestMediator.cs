using MediatR;

namespace OurGame.Api.Tests.TestInfrastructure;

internal sealed class TestMediator : IMediator
{
    private readonly Dictionary<Type, Func<object, CancellationToken, Task<object?>>> _handlers = new();

    public void Register<TRequest, TResponse>(Func<TRequest, CancellationToken, Task<TResponse>> handler)
        where TRequest : IRequest<TResponse>
    {
        _handlers[typeof(TRequest)] = async (request, ct) => await handler((TRequest)request, ct);
    }

    public void Register<TRequest>(Func<TRequest, CancellationToken, Task> handler)
        where TRequest : IRequest
    {
        _handlers[typeof(TRequest)] = async (request, ct) =>
        {
            await handler((TRequest)request, ct);
            return null;
        };
    }

    public Task Publish(object notification, CancellationToken cancellationToken = default)
    {
        return Task.CompletedTask;
    }

    public Task Publish<TNotification>(TNotification notification, CancellationToken cancellationToken = default)
        where TNotification : INotification
    {
        return Task.CompletedTask;
    }

    public Task<TResponse> Send<TResponse>(IRequest<TResponse> request, CancellationToken cancellationToken = default)
    {
        if (_handlers.TryGetValue(request.GetType(), out var handler))
        {
            return SendThroughHandler<TResponse>(handler, request, cancellationToken);
        }

        throw new NotSupportedException($"No test handler registered for {request.GetType().Name}");
    }

    public async Task Send<TRequest>(TRequest request, CancellationToken cancellationToken = default)
        where TRequest : IRequest
    {
        if (_handlers.TryGetValue(request.GetType(), out var handler))
        {
            await handler(request, cancellationToken);
            return;
        }

        throw new NotSupportedException($"No test handler registered for {request.GetType().Name}");
    }

    public Task<object?> Send(object request, CancellationToken cancellationToken = default)
    {
        if (_handlers.TryGetValue(request.GetType(), out var handler))
        {
            return handler(request, cancellationToken);
        }

        throw new NotSupportedException($"No test handler registered for {request.GetType().Name}");
    }

    public IAsyncEnumerable<TResponse> CreateStream<TResponse>(IStreamRequest<TResponse> request, CancellationToken cancellationToken = default)
    {
        return EmptyAsync<TResponse>();
    }

    public IAsyncEnumerable<object?> CreateStream(object request, CancellationToken cancellationToken = default)
    {
        return EmptyAsync<object?>();
    }

    private static async Task<TResponse> SendThroughHandler<TResponse>(Func<object, CancellationToken, Task<object?>> handler, object request, CancellationToken ct)
    {
        var result = await handler(request, ct);
        return (TResponse)result!;
    }

    private static async IAsyncEnumerable<T> EmptyAsync<T>()
    {
        await Task.CompletedTask;
        yield break;
    }
}
