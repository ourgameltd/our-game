using OurGame.Application.Extensions;

namespace OurGame.Application.Tests.Extensions;

public class PollyXTests
{
    [Fact]
    public async Task WithRetry_SuccessOnFirstAttempt_ReturnsResult()
    {
        var client = new FakeClient();

        var result = await client.WithRetry(c => c.GetValueAsync("hello"), attempts: 3, backOffFactor: 0.01);

        Assert.Equal("hello", result);
    }

    [Fact]
    public async Task WithRetry_SuccessAfterRetries_ReturnsResult()
    {
        var client = new FakeClient { FailCount = 2 };

        var result = await client.WithRetry(c => c.GetValueAsync("hello"), attempts: 3, backOffFactor: 0.01);

        Assert.Equal("hello", result);
    }

    [Fact]
    public async Task WithRetry_AllAttemptsFail_ReturnsNull()
    {
        var client = new FakeClient { AlwaysFail = true };

        var result = await client.WithRetry(c => c.GetValueAsync("hello"), attempts: 2, backOffFactor: 0.01);

        Assert.Null(result);
    }

    private class FakeClient
    {
        public int FailCount { get; set; }
        public bool AlwaysFail { get; set; }
        private int _callCount;

        public Task<string?> GetValueAsync(string input)
        {
            _callCount++;

            if (AlwaysFail || _callCount <= FailCount)
            {
                return Task.FromResult<string?>(null);
            }

            return Task.FromResult<string?>(input);
        }
    }
}
