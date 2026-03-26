using Azure.Core.Serialization;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.DependencyInjection;
using Moq;

namespace OurGame.Api.Tests.TestInfrastructure;

internal static class TestFunctionContextFactory
{
    public static FunctionContext Create()
    {
        var services = new ServiceCollection();
        services.AddOptions<WorkerOptions>()
            .Configure(options =>
            {
                options.Serializer = new JsonObjectSerializer();
            });

        var serviceProvider = services.BuildServiceProvider();

        var context = new Mock<FunctionContext>();
        context.SetupGet(c => c.InstanceServices).Returns(serviceProvider);
        context.SetupProperty(c => c.Items, new Dictionary<object, object>());
        context.SetupGet(c => c.TraceContext).Returns(new Mock<TraceContext>().Object);
        context.SetupGet(c => c.BindingContext).Returns(new Mock<BindingContext>().Object);
        context.SetupGet(c => c.FunctionDefinition).Returns(new Mock<FunctionDefinition>().Object);
        context.SetupGet(c => c.Features).Returns(new Mock<IInvocationFeatures>().Object);
        context.SetupGet(c => c.InvocationId).Returns(Guid.NewGuid().ToString("N"));
        context.SetupGet(c => c.FunctionId).Returns("test-function");

        return context.Object;
    }
}
