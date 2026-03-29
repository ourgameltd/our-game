using System.Reflection;
using MediatR;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Moq;
using OurGame.Api.Attributes;
using OurGame.Api.Functions;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Persistence.Models;

namespace OurGame.Api.Tests.Coverage;

public class AllEndpointUnauthorizedContractTests
{
    [Theory]
    [MemberData(nameof(GetEndpointMethods))]
    public async Task Endpoint_ReturnsUnauthorized_WhenClientPrincipalMissing(Type functionType, MethodInfo method)
    {
        var sut = CreateFunctionInstance(functionType);
        var request = new TestHttpRequestData(
            TestFunctionContextFactory.Create(),
            method.Name.StartsWith("Get", StringComparison.OrdinalIgnoreCase) ? "GET" : "POST",
            $"https://localhost/{functionType.Name}/{method.Name}",
            "{}");

        var args = BuildInvocationArgs(method, request);
        var invocation = method.Invoke(sut, args);

        Assert.NotNull(invocation);
        var task = Assert.IsAssignableFrom<Task<HttpResponseData>>(invocation);
        var response = await task;

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    public static IEnumerable<object[]> GetEndpointMethods()
    {
        var assembly = typeof(UserFunctions).Assembly;

        return assembly
            .GetTypes()
            .Where(static type => type.IsClass
                && type.IsPublic
                && type.Namespace != null
                && type.Namespace.StartsWith("OurGame.Api.Functions", StringComparison.Ordinal)
                && type.GetMethods(BindingFlags.Instance | BindingFlags.Public)
                    .Any(static method => IsEndpointMethod(method)))
            .OrderBy(static type => type.FullName, StringComparer.Ordinal)
            .SelectMany(static type => type
                .GetMethods(BindingFlags.Instance | BindingFlags.Public)
                .Where(static method => IsEndpointMethod(method))
                .OrderBy(static method => method.Name, StringComparer.Ordinal)
                .Select(method => new object[] { type, method }));
    }

    private static bool IsEndpointMethod(MethodInfo method)
    {
        return method.ReturnType == typeof(Task<HttpResponseData>)
            && method.GetParameters().Length > 0
            && method.GetParameters()[0].ParameterType == typeof(HttpRequestData)
            && !method.IsDefined(typeof(AllowAnonymousEndpointAttribute), inherit: false);
    }

    private static object CreateFunctionInstance(Type functionType)
    {
        var ctor = functionType.GetConstructors(BindingFlags.Instance | BindingFlags.Public)
            .OrderByDescending(static c => c.GetParameters().Length)
            .FirstOrDefault();

        Assert.NotNull(ctor);

        var args = ctor!.GetParameters()
            .Select(CreateConstructorArgument)
            .ToArray();

        return Activator.CreateInstance(functionType, args)!;
    }

    private static object? CreateConstructorArgument(ParameterInfo parameter)
    {
        var parameterType = parameter.ParameterType;

        if (parameterType == typeof(IMediator))
        {
            return new TestMediator();
        }

        if (parameterType.IsGenericType
            && parameterType.GetGenericTypeDefinition() == typeof(ILogger<>))
        {
            var mockType = typeof(Mock<>).MakeGenericType(parameterType);
            var mock = Activator.CreateInstance(mockType);
            var objectProperty = mockType
                .GetProperties(BindingFlags.Public | BindingFlags.Instance)
                .Single(property => property.Name == "Object" && property.PropertyType == parameterType);
            return objectProperty.GetValue(mock);
        }

        if (parameterType == typeof(OurGameContext))
        {
            return null;
        }

        throw new NotSupportedException($"Unsupported constructor dependency for {parameter.Member.DeclaringType?.Name}: {parameterType.Name}");
    }

    private static object?[] BuildInvocationArgs(MethodInfo method, HttpRequestData request)
    {
        return method.GetParameters()
            .Select(parameter =>
            {
                if (parameter.ParameterType == typeof(HttpRequestData))
                {
                    return (object?)request;
                }

                if (parameter.ParameterType == typeof(string))
                {
                    return (object?)Guid.NewGuid().ToString("N");
                }

                if (parameter.ParameterType == typeof(CancellationToken))
                {
                    return (object?)CancellationToken.None;
                }

                throw new NotSupportedException($"Unsupported endpoint parameter type on {method.DeclaringType?.Name}.{method.Name}: {parameter.ParameterType.Name}");
            })
            .ToArray();
    }
}
