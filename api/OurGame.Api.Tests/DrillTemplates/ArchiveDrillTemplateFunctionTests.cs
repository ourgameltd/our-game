using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions.DrillTemplates;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.DrillTemplates.Commands.ArchiveDrillTemplate;

namespace OurGame.Api.Tests.DrillTemplates;

public class ArchiveDrillTemplateFunctionTests
{
    [Fact]
    public async Task ArchiveDrillTemplate_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("PUT", "https://localhost/v1/drill-templates/00000000-0000-0000-0000-000000000001/archive", "{}");

        var response = await sut.ArchiveDrillTemplate(req, "00000000-0000-0000-0000-000000000001");

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(401, payload.StatusCode);
    }

    [Fact]
    public async Task ArchiveDrillTemplate_ReturnsBadRequest_WhenIdIsInvalidGuid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", "https://localhost/v1/drill-templates/not-a-guid/archive", authId, "{}");

        var response = await sut.ArchiveDrillTemplate(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid drill template ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task ArchiveDrillTemplate_ReturnsBadRequest_WhenRequestBodyIsNull()
    {
        var authId = Guid.NewGuid().ToString("N");
        var templateId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/drill-templates/{templateId}/archive", authId, "null");

        var response = await sut.ArchiveDrillTemplate(req, templateId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<object>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid request body", payload.Error?.Message);
    }

    [Fact]
    public async Task ArchiveDrillTemplate_ReturnsForbidden_WhenUnauthorizedAccessExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var templateId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<ArchiveDrillTemplateCommand>((_, _) =>
            throw new UnauthorizedAccessException("Only the creating coach can archive this drill template"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/drill-templates/{templateId}/archive", authId, "{\"isArchived\":true}");

        var response = await sut.ArchiveDrillTemplate(req, templateId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task ArchiveDrillTemplate_ReturnsNotFound_WhenNotFoundExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var templateId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<ArchiveDrillTemplateCommand>((_, _) =>
            throw new NotFoundException("DrillTemplate", templateId.ToString()));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/drill-templates/{templateId}/archive", authId, "{\"isArchived\":true}");

        var response = await sut.ArchiveDrillTemplate(req, templateId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task ArchiveDrillTemplate_ReturnsNoContent_WhenArchiveSucceeds()
    {
        var authId = Guid.NewGuid().ToString("N");
        var templateId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<ArchiveDrillTemplateCommand>((_, _) => Task.CompletedTask);

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/drill-templates/{templateId}/archive", authId, "{\"isArchived\":true}");

        var response = await sut.ArchiveDrillTemplate(req, templateId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NoContent, response.StatusCode);
    }

    private static ArchiveDrillTemplateFunction BuildSut(TestMediator mediator)
    {
        return new ArchiveDrillTemplateFunction(mediator, NullLogger<ArchiveDrillTemplateFunction>.Instance);
    }

    private static TestHttpRequestData CreateRequest(string method, string url, string? body = null)
    {
        return new TestHttpRequestData(TestFunctionContextFactory.Create(), method, url, body);
    }

    private static TestHttpRequestData CreateAuthedRequest(string method, string url, string authId, string? body = null)
    {
        var req = CreateRequest(method, url, body);
        req.AddClientPrincipalHeader(authId);
        return req;
    }
}
