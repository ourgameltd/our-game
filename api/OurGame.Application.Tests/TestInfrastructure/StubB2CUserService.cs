using OurGame.Application.Abstractions;

namespace OurGame.Application.Tests.TestInfrastructure;

/// <summary>
/// Configurable stub implementation of <see cref="IB2CUserService"/> for unit tests.
/// Returns the configured profile or <c>null</c> by default.
/// </summary>
public sealed class StubB2CUserService : IB2CUserService
{
    private B2CUserProfile? _profile;

    /// <summary>
    /// Tracks how many times <see cref="GetUserAsync"/> was called.
    /// </summary>
    public int CallCount { get; private set; }

    /// <summary>
    /// Configures the profile to return from <see cref="GetUserAsync"/>.
    /// </summary>
    public void Returns(B2CUserProfile? profile) => _profile = profile;

    public Task<B2CUserProfile?> GetUserAsync(string objectId, CancellationToken cancellationToken = default)
    {
        CallCount++;
        return Task.FromResult(_profile);
    }
}
