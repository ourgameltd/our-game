using MediatR;
using Microsoft.Extensions.Configuration;

namespace OurGame.Application.UseCases.PushSubscriptions.Queries.GetVapidPublicKey;

/// <summary>
/// Query to retrieve the VAPID public key that the browser needs when subscribing to push.
/// </summary>
public record GetVapidPublicKeyQuery : IRequest<string>;

/// <summary>
/// Handler that returns the VAPID public key from configuration.
/// </summary>
public class GetVapidPublicKeyHandler : IRequestHandler<GetVapidPublicKeyQuery, string>
{
    private readonly IConfiguration _configuration;

    public GetVapidPublicKeyHandler(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public Task<string> Handle(GetVapidPublicKeyQuery request, CancellationToken cancellationToken)
    {
        var publicKey = _configuration["Vapid:PublicKey"]
            ?? throw new InvalidOperationException("VAPID public key is not configured. Set 'Vapid:PublicKey' in application settings.");

        return Task.FromResult(publicKey);
    }
}
