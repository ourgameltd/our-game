using OurGame.Application.Abstractions;

namespace OurGame.Application.Services;

/// <summary>
/// No-op implementation of <see cref="IB2CUserService"/> used during local development.
/// Always returns <c>null</c>, allowing the <c>EnsureUserByAuthIdHandler</c> to fall back to
/// claims supplied by the Azure Static Web Apps emulator cookie.
/// </summary>
public sealed class LocalB2CUserService : IB2CUserService
{
    public Task<B2CUserProfile?> GetUserAsync(string objectId, CancellationToken cancellationToken = default)
        => Task.FromResult<B2CUserProfile?>(null);
}
