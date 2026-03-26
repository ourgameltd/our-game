using Microsoft.Extensions.Logging.Abstractions;
using OurGame.Api.Functions;
using OurGame.Api.Tests.TestInfrastructure;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Reports.Queries.GetReportById;
using OurGame.Application.UseCases.Reports.Queries.GetReportById.DTOs;
using OurGame.Application.UseCases.Reports.Commands.CreateReport;
using OurGame.Application.UseCases.Reports.Commands.CreateReport.DTOs;
using OurGame.Application.UseCases.Reports.Commands.UpdateReport;
using OurGame.Application.UseCases.Reports.Commands.UpdateReport.DTOs;

namespace OurGame.Api.Tests.Reports;

public class ReportFunctionsTests
{
    // ── GetReportById ───────────────────────────────────────────────────

    [Fact]
    public async Task GetReportById_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("GET", "https://localhost/v1/reports/00000000-0000-0000-0000-000000000001");

        var response = await sut.GetReportById(req, "00000000-0000-0000-0000-000000000001");

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetReportById_ReturnsBadRequest_WhenIdFormatInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("GET", "https://localhost/v1/reports/not-a-guid", authId);

        var response = await sut.GetReportById(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ReportDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid report ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task GetReportById_ReturnsNotFound_WhenReportDoesNotExist()
    {
        var authId = Guid.NewGuid().ToString("N");
        var reportId = Guid.NewGuid();
        var mediator = new TestMediator();
        mediator.Register<GetReportByIdQuery, ReportDto?>((_, _) =>
            Task.FromResult<ReportDto?>(null));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/reports/{reportId}", authId);

        var response = await sut.GetReportById(req, reportId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ReportDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
        Assert.Equal("Report not found", payload.Error?.Message);
    }

    [Fact]
    public async Task GetReportById_ReturnsOk_WhenReportExists()
    {
        var authId = Guid.NewGuid().ToString("N");
        var reportId = Guid.NewGuid();
        var expected = new ReportDto { Id = reportId };

        var mediator = new TestMediator();
        mediator.Register<GetReportByIdQuery, ReportDto?>((_, _) =>
            Task.FromResult<ReportDto?>(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("GET", $"https://localhost/v1/reports/{reportId}", authId);

        var response = await sut.GetReportById(req, reportId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ReportDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(reportId, payload.Data!.Id);
    }

    // ── CreateReport ────────────────────────────────────────────────────

    [Fact]
    public async Task CreateReport_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("POST", "https://localhost/v1/reports");

        var response = await sut.CreateReport(req);

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task CreateReport_ReturnsBadRequest_WhenBodyDeserializesToNull()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("POST", "https://localhost/v1/reports", authId, body: "null");

        var response = await sut.CreateReport(req);

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ReportDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid request body", payload.Error?.Message);
    }

    [Fact]
    public async Task CreateReport_ReturnsCreated_WhenRequestIsValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var body = "{}";
        var expected = new ReportDto { Id = Guid.NewGuid() };

        var mediator = new TestMediator();
        mediator.Register<CreateReportCommand, ReportDto>((_, _) =>
            Task.FromResult(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("POST", "https://localhost/v1/reports", authId, body);

        var response = await sut.CreateReport(req);

        Assert.Equal(System.Net.HttpStatusCode.Created, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ReportDto>(response);
        Assert.True(payload.Success);
        Assert.NotNull(payload.Data);
        Assert.Equal(expected.Id, payload.Data!.Id);
    }

    // ── UpdateReport ────────────────────────────────────────────────────

    [Fact]
    public async Task UpdateReport_ReturnsUnauthorized_WhenClientPrincipalHeaderMissing()
    {
        var sut = BuildSut(new TestMediator());
        var req = CreateRequest("PUT", "https://localhost/v1/reports/00000000-0000-0000-0000-000000000001");

        var response = await sut.UpdateReport(req, "00000000-0000-0000-0000-000000000001");

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task UpdateReport_ReturnsBadRequest_WhenIdFormatInvalid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", "https://localhost/v1/reports/not-a-guid", authId, body: "{}");

        var response = await sut.UpdateReport(req, "not-a-guid");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ReportDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid report ID format", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateReport_ReturnsBadRequest_WhenBodyDeserializesToNull()
    {
        var authId = Guid.NewGuid().ToString("N");
        var reportId = Guid.NewGuid();
        var sut = BuildSut(new TestMediator());
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/reports/{reportId}", authId, body: "null");

        var response = await sut.UpdateReport(req, reportId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ReportDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(400, payload.StatusCode);
        Assert.Equal("Invalid request body", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateReport_ReturnsNotFound_WhenReportDoesNotExist()
    {
        var authId = Guid.NewGuid().ToString("N");
        var reportId = Guid.NewGuid();
        var body = "{}";

        var mediator = new TestMediator();
        mediator.Register<UpdateReportCommand, ReportDto?>((_, _) =>
            Task.FromResult<ReportDto?>(null));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/reports/{reportId}", authId, body);

        var response = await sut.UpdateReport(req, reportId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ReportDto>(response);
        Assert.False(payload.Success);
        Assert.Equal(404, payload.StatusCode);
        Assert.Equal("Report not found", payload.Error?.Message);
    }

    [Fact]
    public async Task UpdateReport_ReturnsOk_WhenRequestIsValid()
    {
        var authId = Guid.NewGuid().ToString("N");
        var reportId = Guid.NewGuid();
        var body = "{}";
        var expected = new ReportDto { Id = reportId };

        var mediator = new TestMediator();
        mediator.Register<UpdateReportCommand, ReportDto?>((_, _) =>
            Task.FromResult<ReportDto?>(expected));

        var sut = BuildSut(mediator);
        var req = CreateAuthedRequest("PUT", $"https://localhost/v1/reports/{reportId}", authId, body);

        var response = await sut.UpdateReport(req, reportId.ToString());

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var payload = await HttpResponseAssertions.ReadApiResponseAsync<ReportDto>(response);
        Assert.True(payload.Success);
        Assert.Equal(200, payload.StatusCode);
        Assert.NotNull(payload.Data);
        Assert.Equal(expected.Id, payload.Data!.Id);
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    private static ReportFunctions BuildSut(TestMediator mediator)
    {
        return new ReportFunctions(mediator, NullLogger<ReportFunctions>.Instance);
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
