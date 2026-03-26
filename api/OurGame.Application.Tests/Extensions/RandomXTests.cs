using OurGame.Application.Extensions;

namespace OurGame.Application.Tests.Extensions;

public class RandomXTests
{
    [Fact]
    public void Get_DefaultUpper_ReturnsValueInRange()
    {
        var result = RandomX.Get();

        Assert.InRange(result, 0, 999998);
    }

    [Fact]
    public void Get_CustomUpper_ReturnsValueInRange()
    {
        var result = RandomX.Get(10);

        Assert.InRange(result, 0, 9);
    }

    [Fact]
    public void Get_MultipleInvocations_ProducesValues()
    {
        // Verify it doesn't throw and produces values
        var results = Enumerable.Range(0, 100).Select(_ => RandomX.Get(100)).ToList();

        Assert.All(results, r => Assert.InRange(r, 0, 99));
    }
}
