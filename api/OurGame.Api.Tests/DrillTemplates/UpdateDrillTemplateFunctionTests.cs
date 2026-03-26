using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions.DrillTemplates;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.DrillTemplates.Commands.UpdateDrillTemplate;
using OurGame.Application.UseCases.DrillTemplates.Queries.GetDrillTemplateById.DTOs;

namespace OurGame.Api.Tests.DrillTemplates;

public class UpdateDrillTemplateFunctionTests
{
    // ── UpdateDrillTemplate ─────────────────────────────────────────────

    [Fact]
    public async Task UpdateDrillTemplate_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("PUT", "https://localhost/v1/drill-templates/00000000-0000-0000-0000-000000000001", "{}");

        var response = await sut.UpdateDrillTemplate(req, "00000000-0000-0000-0000-000000000001");

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillTemplateDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(401, payload.StatusCode);
        Assert.Equal("Authentication required", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateDrillTemplate_ReturnsBadRequest_WhenIdIsInvalidGuid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", "https://localhost/v1/drill-templates/not-a-guid", authId, "{}");

        var response = await sut.UpdateDrillTemplate(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillTemplateDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid drill template ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateDrillTemplate_ReturnsBadRequest_WhenRequestBodyIsNull()
    {
        var authId = Guid.NewGuid().ToString("N");
        var templateId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/drill-templates/{templateId}", authId, "null");

        var response = await sut.UpdateDrillTemplate(req, templateId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillTemplateDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid request body", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateDrillTemplate_ReturnsForbidden_WhenUnauthorizedAccessExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var templateId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<UpdateDrillTemplateCommand, DrillTemplateDetailDto>((_, _) =>
            throw new UnauthorizedAccessException("Only the creating coach can update this template"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/drill-templates/{templateId}", authId, "{}");

        var response = await sut.UpdateDrillTemplate(req, templateId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.Forbidden, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillTemplateDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(403, payload.StatusCode);
    }

    [Fact]
    public async Task UpdateDrillTemplate_ReturnsNotFound_WhenNotFoundExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var templateId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<UpdateDrillTemplateCommand, DrillTemplateDetailDto>((_, _) =>
            throw new NotFoundException("Drill template", templateId));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/drill-templates/{templateId}", authId, "{}");

        var response = await sut.UpdateDrillTemplate(req, templateId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillTemplateDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
    }

    [Fact]
    public async Task UpdateDrillTemplate_ReturnsBadRequest_WhenValidationExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var templateId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<UpdateDrillTemplateCommand, DrillTemplateDetailDto>((_, _) =>
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["Name"] = new[] { "Name is required." }
            }));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/drill-templates/{templateId}", authId, "{}");

        var response = await sut.UpdateDrillTemplate(req, templateId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillTemplateDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Validation failed", payload.Error?.Message);
        Assert.Equal("VALIDATION_ERROR", payload.Error?.Code);
        Assert.NotNull(payload.Error?.ValidationErrors);
    }

    [Fact]
    public async Task UpdateDrillTemplate_ReturnsInternalServerError_WhenUnexpectedExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");
        var templateId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<UpdateDrillTemplateCommand, DrillTemplateDetailDto>((_, _) =>
            throw new InvalidOperationException("boom"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/drill-templates/{templateId}", authId, "{}");

        var response = await sut.UpdateDrillTemplate(req, templateId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.InternalServerError, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillTemplateDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(500, payload.StatusCode);
        Assert.Equal("An error occurred while updating the drill template", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateDrillTemplate_ReturnsOk_WhenUpdateSucceeds()
    {
        var authId = Guid.NewGuid().ToString("N");
        var templateId = Guid.NewGuid();
        var expected = new DrillTemplateDetailDto { Id = templateId };

        var mediator = new TestMediator();
        mediator.Register<UpdateDrillTemplateCommand, DrillTemplateDetailDto>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/drill-templates/{templateId}", authId, "{}");

        var response = await sut.UpdateDrillTemplate(req, templateId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillTemplateDetailDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(templateId, payload.Data!.Id);
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    private static UpdateDrillTemplateFunction BuildSut(TestMediator mediator)
    {
        return new UpdateDrillTemplateFunction(mediator, NullLogger<UpdateDrillTemplateFunction>.Instance);
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
