using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions.DrillTemplates;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.DrillTemplates.Queries.GetDrillTemplateById;
using OurGame.Application.UseCases.DrillTemplates.Queries.GetDrillTemplateById.DTOs;

namespace OurGame.Api.Tests.DrillTemplates;

public class GetDrillTemplateByIdFunctionTests
{
    // ── GetDrillTemplateById ────────────────────────────────────────────

    [Fact]
    public async Task GetDrillTemplateById_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("GET", "https://localhost/v1/drill-templates/00000000-0000-0000-0000-000000000001");

        var response = await sut.GetDrillTemplateById(req, "00000000-0000-0000-0000-000000000001");

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetDrillTemplateById_ReturnsBadRequest_WhenIdIsInvalidGuid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/drill-templates/not-a-guid", authId);

        var response = await sut.GetDrillTemplateById(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillTemplateDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid drill template ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetDrillTemplateById_ReturnsNotFound_WhenMediatorReturnsNull()
    {
        var authId = Guid.NewGuid().ToString("N");
        var templateId = Guid.NewGuid();

        var mediator = new TestMediator();
        mediator.Register<GetDrillTemplateByIdQuery, DrillTemplateDetailDto?>((_, _) =>
            Task.FromResult<DrillTemplateDetailDto?>(null));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/drill-templates/{templateId}", authId);

        var response = await sut.GetDrillTemplateById(req, templateId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillTemplateDetailDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
        Assert.Equal("Drill template not found", payload.Error?.Message);
    }

    [Fact]
    public async Task GetDrillTemplateById_ReturnsOk_WhenTemplateExists()
    {
        var authId = Guid.NewGuid().ToString("N");
        var templateId = Guid.NewGuid();
        var expected = new DrillTemplateDetailDto { Id = templateId };

        var mediator = new TestMediator();
        mediator.Register<GetDrillTemplateByIdQuery, DrillTemplateDetailDto?>((_, _) =>
            Task.FromResult<DrillTemplateDetailDto?>(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/drill-templates/{templateId}", authId);

        var response = await sut.GetDrillTemplateById(req, templateId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<DrillTemplateDetailDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(templateId, payload.Data!.Id);
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    private static GetDrillTemplateByIdFunction BuildSut(TestMediator mediator)
    {
        return new GetDrillTemplateByIdFunction(mediator, NullLogger<GetDrillTemplateByIdFunction>.Instance);
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
