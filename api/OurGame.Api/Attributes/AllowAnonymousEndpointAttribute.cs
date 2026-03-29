namespace OurGame.Api.Attributes;

/// <summary>
/// Marks an Azure Function endpoint as intentionally anonymous (no authentication required).
/// This attribute is used by contract tests to skip the unauthorized-access check.
/// </summary>
[AttributeUsage(AttributeTargets.Method, AllowMultiple = false, Inherited = false)]
public sealed class AllowAnonymousEndpointAttribute : Attribute
{
}
