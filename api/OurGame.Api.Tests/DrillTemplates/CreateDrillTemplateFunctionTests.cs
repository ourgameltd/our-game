using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions.DrillTemplates;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.DrillTemplates.Commands.CreateDrillTemplate;
using OurGame.Application.UseCases.DrillTemplates.Queries.GetDrillTemplatesByScope.DTOs;

namespace OurGame.Api.Tests.DrillTemplates;

public class CreateDrillTemplateFunctionTests
{
    // ── CreateDrillTemplate ─────────────────────────────────────────────

    [Fact]
    public async Task CreateDrillTemplate_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("POST", "https://localhost/v1/drill-templates", "{}");

        var response = await sut.CreateDrillTemplate(req);

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillTemplateListDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(401, payload.StatusCode);
        Assert.Equal("Authentication required", payload.Error?.Message);
    }

    [Fact]
    public async Task CreateDrillTemplate_ReturnsBadRequest_WhenRequestBodyIsNull()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("POST", "https://localhost/v1/drill-templates", authId, "null");

        var response = await sut.CreateDrillTemplate(req);

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillTemplateListDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid request body", payload.Error?.Message);
    }

    [Fact]
    public async Task CreateDrillTemplate_ReturnsNotFound_WhenNotFoundExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");

        var mediator = new TestMediator();
        mediator.Register<CreateDrillTemplateCommand, DrillTemplateListDto>((_, _) =>
            throw new NotFoundException("Drill", Guid.NewGuid()));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", "https://localhost/v1/drill-templates", authId, "{}");

        var response = await sut.CreateDrillTemplate(req);

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillTemplateListDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
    }

    [Fact]
    public async Task CreateDrillTemplate_ReturnsBadRequest_WhenValidationExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");

        var mediator = new TestMediator();
        mediator.Register<CreateDrillTemplateCommand, DrillTemplateListDto>((_, _) =>
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["Name"] = new[] { "Name is required." }
            }));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", "https://localhost/v1/drill-templates", authId, "{}");

        var response = await sut.CreateDrillTemplate(req);

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillTemplateListDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Validation failed", payload.Error?.Message);
        Assert.Equal("VALIDATION_ERROR", payload.Error?.Code);
        Assert.NotNull(payload.Error?.ValidationErrors);
    }

    [Fact]
    public async Task CreateDrillTemplate_ReturnsInternalServerError_WhenUnexpectedExceptionThrown()
    {
        var authId = Guid.NewGuid().ToString("N");

        var mediator = new TestMediator();
        mediator.Register<CreateDrillTemplateCommand, DrillTemplateListDto>((_, _) =>
            throw new InvalidOperationException("boom"));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", "https://localhost/v1/drill-templates", authId, "{}");

        var response = await sut.CreateDrillTemplate(req);

        Assert.Equal(System.Net.HttpStatusCode.InternalServerError, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillTemplateListDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(500, payload.StatusCode);
        Assert.Equal("An error occurred while creating the drill template", payload.Error?.Message);
    }

    [Fact]
    public async Task CreateDrillTemplate_ReturnsCreated_WhenRequestIsValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var templateId = Guid.NewGuid();
        var expected = new DrillTemplateListDto { Id = templateId };

        var mediator = new TestMediator();
        mediator.Register<CreateDrillTemplateCommand, DrillTemplateListDto>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", "https://localhost/v1/drill-templates", authId, "{}");

        var response = await sut.CreateDrillTemplate(req);

        Assert.Equal(System.Net.HttpStatusCode.Created, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillTemplateListDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(201, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(templateId, payload.Data!.Id);
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    private static CreateDrillTemplateFunction BuildSut(TestMediator mediator)
    {
        return new CreateDrillTemplateFunction(mediator, NullLogger<CreateDrillTemplateFunction>.Instance);
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
