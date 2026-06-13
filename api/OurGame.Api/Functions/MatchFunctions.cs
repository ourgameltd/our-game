using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Attributes;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Matches.Commands.CreateMatch;
using OurGame.Application.UseCases.Matches.Commands.CreateMatch.DTOs;
using OurGame.Application.UseCases.Matches.Commands.UpdateMatch;
using OurGame.Application.UseCases.Matches.Commands.UpdateMatch.DTOs;
using OurGame.Application.UseCases.Matches.Commands.PublishMatchReport;
using OurGame.Application.UseCases.Matches.Commands.PublishMatchReport.DTOs;
using OurGame.Application.UseCases.Matches.Commands.SendMatchNotification;
using OurGame.Application.UseCases.Matches.Commands.SendGoalNotification;
using OurGame.Application.UseCases.Matches.Commands.SendCardNotification;
using OurGame.Application.UseCases.Matches.Commands.UpdateMyMatchAttendance;
using OurGame.Application.UseCases.Matches.Commands.StartMatch;
using OurGame.Application.UseCases.Matches.Commands.EndMatch;
using OurGame.Application.UseCases.Matches.Queries.GetMatchById;
using OurGame.Application.UseCases.Matches.Queries.GetMatchById.DTOs;
using System.Net;
using System.Text.RegularExpressions;

namespace OurGame.Api.Functions;

/// <summary>
/// Azure Functions for Match endpoints
/// </summary>
public class MatchFunctions
{
    private readonly IMediator _mediator;
    private readonly ILogger<MatchFunctions> _logger;

    public MatchFunctions(IMediator mediator, ILogger<MatchFunctions> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get a match by ID with full detail
    /// </summary>
    [Function("GetMatchById")]
    [OpenApiOperation(
        operationId: "GetMatchById",
        tags: new[] { "Matches" },
        Summary = "Get match by ID",
        Description = "Retrieves full match detail including lineup, coaches, report, goals, cards, substitutions, injuries, and performance ratings")]
    [OpenApiParameter(
        name: "id",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The match ID")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.OK,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<MatchDetailDto>),
        Description = "Match retrieved successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.Unauthorized,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<MatchDetailDto>),
        Description = "User not authenticated")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<MatchDetailDto>),
        Description = "Match not found")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<MatchDetailDto>),
        Description = "Invalid match ID format")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.InternalServerError,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<MatchDetailDto>),
        Description = "Internal server error")]
    public async Task<HttpResponseData> GetMatchById(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/matches/{id}")] HttpRequestData req,
        string id)
    {
        var azureUserId = req.GetUserId();

        if (string.IsNullOrEmpty(azureUserId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(id, out var matchGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<MatchDetailDto>.ErrorResponse(
                "Invalid match ID format", 400));
            return badRequestResponse;
        }

        var match = await _mediator.Send(new GetMatchByIdQuery(matchGuid, azureUserId));

        if (match == null)
        {
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<MatchDetailDto>.ErrorResponse(
                "Match not found", 404));
            return notFoundResponse;
        }

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<MatchDetailDto>.SuccessResponse(match));
        return response;
    }

    /// <summary>
    /// Get a match report by match ID with authorization check
    /// </summary>
    [Function("GetMatchReport")]
    [OpenApiOperation(
        operationId: "GetMatchReport",
        tags: new[] { "Matches" },
        Summary = "Get match report by match ID",
        Description = "Retrieves full match report with authorization check. User must be associated with one of the teams (coach, player, or parent).")]
    [OpenApiParameter(
        name: "id",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The match ID")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.OK,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<MatchDetailDto>),
        Description = "Match report retrieved successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.Unauthorized,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<MatchDetailDto>),
        Description = "User not authenticated")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<MatchDetailDto>),
        Description = "Match not found or user not authorized")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<MatchDetailDto>),
        Description = "Invalid match ID format")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.InternalServerError,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<MatchDetailDto>),
        Description = "Internal server error")]
    public async Task<HttpResponseData> GetMatchReport(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/matches/{id}/report")] HttpRequestData req,
        string id)
    {
        var azureUserId = req.GetUserId();

        if (string.IsNullOrEmpty(azureUserId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(id, out var matchGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<MatchDetailDto>.ErrorResponse(
                "Invalid match ID format", 400));
            return badRequestResponse;
        }

        var match = await _mediator.Send(new GetMatchByIdQuery(matchGuid, azureUserId));

        if (match == null)
        {
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<MatchDetailDto>.ErrorResponse(
                "Match not found", 404));
            return notFoundResponse;
        }

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<MatchDetailDto>.SuccessResponse(match));
        return response;
    }

    /// <summary>
    /// Get a published social match report by match ID (anonymous).
    /// </summary>
    [Function("GetPublishedMatchReport")]
    [AllowAnonymousEndpoint]
    [OpenApiOperation(
        operationId: "GetPublishedMatchReport",
        tags: new[] { "Matches", "Public" },
        Summary = "Get published match report",
        Description = "Retrieves a published public match report for social sharing.")]
    [OpenApiParameter(
        name: "id",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The match ID")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.OK,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<PublishedMatchReportDto>),
        Description = "Published match report retrieved successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<PublishedMatchReportDto>),
        Description = "Published match report not found")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<PublishedMatchReportDto>),
        Description = "Invalid match ID format")]
    public async Task<HttpResponseData> GetPublishedMatchReport(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/social/match/{id}/report")] HttpRequestData req,
        string id)
    {
        if (!Guid.TryParse(id, out var matchGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<PublishedMatchReportDto>.ErrorResponse(
                "Invalid match ID format", 400));
            return badRequestResponse;
        }

        var match = await _mediator.Send(new GetMatchByIdQuery(matchGuid));
        if (match == null || !match.IsPublished || match.Report == null)
        {
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<PublishedMatchReportDto>.ErrorResponse(
                "Published match report not found", 404));
            return notFoundResponse;
        }

        var scoreText = match.HomeScore.HasValue && match.AwayScore.HasValue
            ? $"{match.HomeScore} – {match.AwayScore}"
            : null;
        var ogTitle = scoreText != null
            ? $"{match.TeamName} {scoreText} {match.Opposition} | Match Report"
            : $"{match.TeamName} vs {match.Opposition} | Match Report";
        var ogDescription = scoreText != null
            ? $"{match.TeamName} {scoreText} {match.Opposition} in {match.Competition}."
            : $"{match.TeamName} vs {match.Opposition} in {match.Competition}.";
        if (!string.IsNullOrWhiteSpace(match.Report.Summary))
        {
            var plain = match.Report.Summary.Length > 120
                ? match.Report.Summary[..120].TrimEnd() + "…"
                : match.Report.Summary;
            ogDescription += $" {plain}";
        }

        var dto = new PublishedMatchReportDto
        {
            MatchId = match.Id,
            ClubId = match.ClubId,
            ClubName = match.ClubName,
            ClubLogo = match.ClubLogo,
            ClubPrimaryColor = match.ClubPrimaryColor,
            ClubSecondaryColor = match.ClubSecondaryColor,
            TeamName = match.TeamName,
            Opposition = match.Opposition,
            MatchDate = match.MatchDate,
            Competition = match.Competition,
            Location = match.Location,
            IsHome = match.IsHome,
            HomeScore = match.HomeScore,
            AwayScore = match.AwayScore,
            Summary = match.Report.Summary,
            PlayerOfMatchName = match.Report.PlayerOfMatchName,
            PlayerOfMatchPhoto = match.Report.PlayerOfMatchPhoto,
            Goals = match.Report.Goals
                .Select(g => new PublishedGoalDto(g.ScorerName, g.Minute, g.IsPenalty, g.Period))
                .ToList(),
            Cards = match.Report.Cards
                .Select(c => new PublishedCardDto(c.PlayerName, c.Type, c.Minute, c.Period))
                .ToList(),
            StartingPlayers = (match.Lineup?.Players ?? [])
                .Where(p => p.IsStarting)
                .OrderBy(p => p.PositionIndex)
                .Select(p => new PublishedLineupPlayerDto(p.FirstName, p.LastName, p.Position, p.SquadNumber))
                .ToList(),
            Substitutes = (match.Lineup?.Players ?? [])
                .Where(p => !p.IsStarting)
                .Select(p => new PublishedLineupPlayerDto(p.FirstName, p.LastName, p.Position, p.SquadNumber))
                .ToList(),
            OgTitle = ogTitle,
            OgDescription = ogDescription,
            OgImage = match.ClubLogo
        };

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<PublishedMatchReportDto>.SuccessResponse(dto));
        return response;
    }

    /// <summary>
    /// Serve an HTML page with OG meta tags for social sharing of a published match report.
    /// Azure SWA rewrites /social/match/*/report to this endpoint.
    /// </summary>
    [Function("GetSocialMatchReportPageHtml")]
    [AllowAnonymousEndpoint]
    public async Task<HttpResponseData> GetSocialMatchReportPageHtml(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "social-og-page")] HttpRequestData req)
    {
        req.Headers.TryGetValues("x-ms-original-url", out var originalUrlValues);
        var originalUrl = originalUrlValues?.FirstOrDefault() ?? string.Empty;

        var urlMatch = Regex.Match(originalUrl, @"/social/match/([^/?#]+)/report");
        if (!urlMatch.Success || !Guid.TryParse(urlMatch.Groups[1].Value, out var matchGuid))
        {
            var bad = req.CreateResponse(HttpStatusCode.BadRequest);
            bad.Headers.Add("Content-Type", "text/html; charset=utf-8");
            await bad.WriteStringAsync("<html><head><title>Invalid URL</title></head><body><p>Invalid match URL.</p></body></html>");
            return bad;
        }

        var match = await _mediator.Send(new GetMatchByIdQuery(matchGuid));
        if (match == null || !match.IsPublished || match.Report == null)
        {
            var notFound = req.CreateResponse(HttpStatusCode.NotFound);
            notFound.Headers.Add("Content-Type", "text/html; charset=utf-8");
            await notFound.WriteStringAsync("<html><head><title>Not Found</title></head><body><p>Published match report not found.</p></body></html>");
            return notFound;
        }

        req.Headers.TryGetValues("x-forwarded-proto", out var protoValues);
        req.Headers.TryGetValues("x-forwarded-host", out var hostValues);
        var proto = protoValues?.FirstOrDefault() ?? "https";
        var host = hostValues?.FirstOrDefault() ?? req.Url.Host;
        var pageUrl = $"{proto}://{host}/social/match/{matchGuid}/report";

        var scoreText = match.HomeScore.HasValue && match.AwayScore.HasValue
            ? $"{match.HomeScore} – {match.AwayScore}" : null;
        var ogTitle = scoreText != null
            ? $"{match.TeamName} {scoreText} {match.Opposition} | Match Report"
            : $"{match.TeamName} vs {match.Opposition} | Match Report";
        var ogDescription = scoreText != null
            ? $"{match.TeamName} {scoreText} {match.Opposition} in {match.Competition}."
            : $"{match.TeamName} vs {match.Opposition} in {match.Competition}.";
        if (!string.IsNullOrWhiteSpace(match.Report.Summary))
        {
            var plain = match.Report.Summary.Length > 120
                ? match.Report.Summary[..120].TrimEnd() + "…"
                : match.Report.Summary;
            ogDescription += $" {plain}";
        }
        var ogImage = !string.IsNullOrEmpty(match.ClubLogo)
            ? match.ClubLogo
            : $"{proto}://{host}/icons/icon-512x512.png";

        var html = SocialMatchReportHtml.Build(match, ogTitle, ogDescription, ogImage, pageUrl);

        var response = req.CreateResponse(HttpStatusCode.OK);
        response.Headers.Add("Content-Type", "text/html; charset=utf-8");
        response.Headers.Add("Cache-Control", "public, max-age=300");
        await response.WriteStringAsync(html);
        return response;
    }

    /// <summary>
    /// Create a new match
    /// </summary>
    [Function("CreateMatch")]
    [OpenApiOperation(
        operationId: "CreateMatch",
        tags: new[] { "Matches" },
        Summary = "Create a new match",
        Description = "Creates a new match with optional lineup, coaches, substitutions, and match report including goals, cards, injuries, and performance ratings.")]
    [OpenApiRequestBody(
        contentType: "application/json",
        bodyType: typeof(CreateMatchRequest),
        Required = true,
        Description = "Match creation details")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.Created,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<MatchDetailDto>),
        Description = "Match created successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<MatchDetailDto>),
        Description = "Invalid request data")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.Unauthorized,
        Description = "Unauthorized - authentication required")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<MatchDetailDto>),
        Description = "Referenced resource not found (team, player, etc.)")]
    public async Task<HttpResponseData> CreateMatch(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "v1/matches")] HttpRequestData req)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unauthorized access attempt to CreateMatch");
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<MatchDetailDto>.ErrorResponse(
                "Authentication required",
                (int)HttpStatusCode.Unauthorized));
            return unauthorizedResponse;
        }

        try
        {
            var dto = await req.ReadFromJsonAsync<CreateMatchRequest>();
            if (dto == null)
            {
                _logger.LogWarning("Failed to deserialize CreateMatchRequest");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteAsJsonAsync(ApiResponse<MatchDetailDto>.ErrorResponse(
                    "Invalid request body",
                    (int)HttpStatusCode.BadRequest));
                return badRequestResponse;
            }

            var command = new CreateMatchCommand(dto);
            var result = await _mediator.Send(command);

            _logger.LogInformation("Match created successfully: {MatchId}", result.Id);
            var successResponse = req.CreateResponse(HttpStatusCode.Created);
            await successResponse.WriteAsJsonAsync(ApiResponse<MatchDetailDto>.SuccessResponse(result, (int)HttpStatusCode.Created));
            return successResponse;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found during CreateMatch");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<MatchDetailDto>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error during CreateMatch");
            var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await validationResponse.WriteAsJsonAsync(ApiResponse<MatchDetailDto>.ValidationErrorResponse(
                "Validation failed",
                ex.Errors));
            return validationResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating match");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<MatchDetailDto>.ErrorResponse(
                "An error occurred while creating the match",
                (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }

    /// <summary>
    /// Update an existing match
    /// </summary>
    [Function("UpdateMatch")]
    [OpenApiOperation(
        operationId: "UpdateMatch",
        tags: new[] { "Matches" },
        Summary = "Update a match",
        Description = "Updates an existing match. Lineup, coaches, substitutions, and report data are replaced entirely.")]
    [OpenApiParameter(
        name: "id",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The match ID")]
    [OpenApiRequestBody(
        contentType: "application/json",
        bodyType: typeof(UpdateMatchRequest),
        Required = true,
        Description = "Updated match details")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.OK,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<MatchDetailDto>),
        Description = "Match updated successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<MatchDetailDto>),
        Description = "Invalid request data")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.Unauthorized,
        Description = "Unauthorized - authentication required")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<MatchDetailDto>),
        Description = "Match not found")]
    public async Task<HttpResponseData> UpdateMatch(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/matches/{id}")] HttpRequestData req,
        string id)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Unauthorized access attempt to UpdateMatch");
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<MatchDetailDto>.ErrorResponse(
                "Authentication required",
                (int)HttpStatusCode.Unauthorized));
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(id, out var matchGuid))
        {
            _logger.LogWarning("Invalid match ID format: {Id}", id);
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<MatchDetailDto>.ErrorResponse(
                "Invalid match ID format",
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        try
        {
            var dto = await req.ReadFromJsonAsync<UpdateMatchRequest>();
            if (dto == null)
            {
                _logger.LogWarning("Failed to deserialize UpdateMatchRequest");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteAsJsonAsync(ApiResponse<MatchDetailDto>.ErrorResponse(
                    "Invalid request body",
                    (int)HttpStatusCode.BadRequest));
                return badRequestResponse;
            }

            var command = new UpdateMatchCommand(matchGuid, dto);
            var result = await _mediator.Send(command);

            _logger.LogInformation("Match updated successfully: {MatchId}", result.Id);
            var successResponse = req.CreateResponse(HttpStatusCode.OK);
            await successResponse.WriteAsJsonAsync(ApiResponse<MatchDetailDto>.SuccessResponse(result));
            return successResponse;
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found during UpdateMatch");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<MatchDetailDto>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error during UpdateMatch");
            var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await validationResponse.WriteAsJsonAsync(ApiResponse<MatchDetailDto>.ValidationErrorResponse(
                "Validation failed",
                ex.Errors));
            return validationResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating match");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<MatchDetailDto>.ErrorResponse(
                "An error occurred while updating the match",
                (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }

    /// <summary>
    /// Send push notifications to all players and coaches assigned to a match.
    /// </summary>
    [Function("NotifyMatch")]
    [OpenApiOperation(
        operationId: "NotifyMatch",
        tags: new[] { "Matches" },
        Summary = "Notify match participants",
        Description = "Sends a push notification to all players in the attendance list and assigned coaches for the match.")]
    [OpenApiParameter(
        name: "id",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The match ID")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NoContent, Description = "Notifications sent")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Unauthorized, Description = "User not authenticated")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<object>),
        Description = "Match not found")]
    public async Task<HttpResponseData> NotifyMatch(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "v1/matches/{id}/notify")] HttpRequestData req,
        string id,
        CancellationToken ct = default)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            return req.CreateResponse(HttpStatusCode.Unauthorized);
        }

        if (!Guid.TryParse(id, out var matchGuid))
        {
            var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequest.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("Invalid match ID format", 400), ct);
            return badRequest;
        }

        try
        {
            await _mediator.Send(new SendMatchNotificationCommand(matchGuid), ct);
            return req.CreateResponse(HttpStatusCode.NoContent);
        }
        catch (NotFoundException ex)
        {
            var notFound = req.CreateResponse(HttpStatusCode.NotFound);
            await notFound.WriteAsJsonAsync(ApiResponse<object>.NotFoundResponse(ex.Message), ct);
            return notFound;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending match notifications for {MatchId}", matchGuid);
            var error = req.CreateResponse(HttpStatusCode.InternalServerError);
            await error.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("Failed to send notifications", 500), ct);
            return error;
        }
    }

    /// <summary>
    /// Send a goal push notification to all match participants.
    /// </summary>
    [Function("NotifyGoal")]
    [OpenApiOperation(
        operationId: "NotifyGoal",
        tags: new[] { "Matches" },
        Summary = "Notify goal scored",
        Description = "Sends a push notification to all players and coaches for the match announcing a goal.")]
    [OpenApiParameter(
        name: "id",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The match ID")]
    [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(NotifyGoalRequest), Required = true, Description = "Goal details")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NoContent, Description = "Notifications sent")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Unauthorized, Description = "User not authenticated")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<object>),
        Description = "Match not found")]
    public async Task<HttpResponseData> NotifyGoal(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "v1/matches/{id}/notify-goal")] HttpRequestData req,
        string id,
        CancellationToken ct = default)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            return req.CreateResponse(HttpStatusCode.Unauthorized);
        }

        if (!Guid.TryParse(id, out var matchGuid))
        {
            var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequest.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("Invalid match ID format", 400), ct);
            return badRequest;
        }

        NotifyGoalRequest? body;
        try
        {
            body = await req.ReadFromJsonAsync<NotifyGoalRequest>();
        }
        catch
        {
            var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequest.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("Invalid request body", 400), ct);
            return badRequest;
        }

        if (body == null || string.IsNullOrWhiteSpace(body.ScorerName) || string.IsNullOrWhiteSpace(body.Period))
        {
            var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequest.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("ScorerName and Period are required", 400), ct);
            return badRequest;
        }

        try
        {
            await _mediator.Send(new SendGoalNotificationCommand(
                matchGuid,
                body.ScorerName,
                body.Minute,
                body.Period,
                body.HomeScore,
                body.AwayScore,
                body.AddedTimeMinutes,
                body.HomePenScore,
                body.AwayPenScore), ct);
            return req.CreateResponse(HttpStatusCode.NoContent);
        }
        catch (NotFoundException ex)
        {
            var notFound = req.CreateResponse(HttpStatusCode.NotFound);
            await notFound.WriteAsJsonAsync(ApiResponse<object>.NotFoundResponse(ex.Message), ct);
            return notFound;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending goal notification for {MatchId}", matchGuid);
            var error = req.CreateResponse(HttpStatusCode.InternalServerError);
            await error.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("Failed to send goal notification", 500), ct);
            return error;
        }
    }

    public class NotifyGoalRequest
    {
        public string ScorerName { get; set; } = string.Empty;
        public int? Minute { get; set; }
        public int? AddedTimeMinutes { get; set; }
        public string Period { get; set; } = string.Empty;
        public int HomeScore { get; set; }
        public int AwayScore { get; set; }
        public int? HomePenScore { get; set; }
        public int? AwayPenScore { get; set; }
    }

    /// <summary>
    /// Notify participants of a card event during a match.
    /// </summary>
    [Function("NotifyCard")]
    [OpenApiOperation(
        operationId: "NotifyCard",
        tags: new[] { "Matches" },
        Summary = "Notify card issued",
        Description = "Sends a push notification to all players and coaches for the match announcing a yellow or red card.")]
    [OpenApiParameter(
        name: "id",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The match ID")]
    [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(NotifyCardRequest), Required = true, Description = "Card details")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NoContent, Description = "Notifications sent")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Unauthorized, Description = "User not authenticated")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<object>),
        Description = "Match not found")]
    public async Task<HttpResponseData> NotifyCard(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "v1/matches/{id}/notify-card")] HttpRequestData req,
        string id,
        CancellationToken ct = default)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            return req.CreateResponse(HttpStatusCode.Unauthorized);
        }

        if (!Guid.TryParse(id, out var matchGuid))
        {
            var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequest.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("Invalid match ID format", 400), ct);
            return badRequest;
        }

        NotifyCardRequest? body;
        try
        {
            body = await req.ReadFromJsonAsync<NotifyCardRequest>();
        }
        catch
        {
            var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequest.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("Invalid request body", 400), ct);
            return badRequest;
        }

        if (body == null || string.IsNullOrWhiteSpace(body.PlayerName) || string.IsNullOrWhiteSpace(body.CardType) || string.IsNullOrWhiteSpace(body.Period))
        {
            var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequest.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("PlayerName, CardType and Period are required", 400), ct);
            return badRequest;
        }

        try
        {
            await _mediator.Send(new SendCardNotificationCommand(
                matchGuid,
                body.PlayerName,
                body.CardType,
                body.Minute,
                body.Period,
                body.HomeScore,
                body.AwayScore), ct);
            return req.CreateResponse(HttpStatusCode.NoContent);
        }
        catch (NotFoundException ex)
        {
            var notFound = req.CreateResponse(HttpStatusCode.NotFound);
            await notFound.WriteAsJsonAsync(ApiResponse<object>.NotFoundResponse(ex.Message), ct);
            return notFound;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending card notification for {MatchId}", matchGuid);
            var error = req.CreateResponse(HttpStatusCode.InternalServerError);
            await error.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("Failed to send card notification", 500), ct);
            return error;
        }
    }

    public class NotifyCardRequest
    {
        public string PlayerName { get; set; } = string.Empty;
        public string CardType { get; set; } = string.Empty;
        public int Minute { get; set; }
        public string Period { get; set; } = string.Empty;
        public int HomeScore { get; set; }
        public int AwayScore { get; set; }
    }

    /// <summary>
    /// Mark a match as in-progress (kicked off) and notify all participants.
    /// </summary>
    [Function("StartMatch")]
    [OpenApiOperation(
        operationId: "StartMatch",
        tags: new[] { "Matches" },
        Summary = "Start a match",
        Description = "Sets the match status to in-progress and sends a kick-off push notification to all players and coaches. Caller must be a coach for the team.")]
    [OpenApiParameter(
        name: "id",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The match ID")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NoContent, Description = "Match started and notifications sent")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Unauthorized, Description = "User not authenticated")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.Forbidden,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<object>),
        Description = "Caller is not a coach for this team")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<object>),
        Description = "Match not found")]
    public async Task<HttpResponseData> StartMatch(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "v1/matches/{id}/start")] HttpRequestData req,
        string id,
        CancellationToken ct = default)
    {
        var authId = req.GetUserId();
        if (string.IsNullOrEmpty(authId))
            return req.CreateResponse(HttpStatusCode.Unauthorized);

        if (!Guid.TryParse(id, out var matchGuid))
        {
            var bad = req.CreateResponse(HttpStatusCode.BadRequest);
            await bad.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("Invalid match ID format", 400), ct);
            return bad;
        }

        try
        {
            await _mediator.Send(new StartMatchCommand(matchGuid, authId), ct);
            return req.CreateResponse(HttpStatusCode.NoContent);
        }
        catch (NotFoundException ex)
        {
            var notFound = req.CreateResponse(HttpStatusCode.NotFound);
            await notFound.WriteAsJsonAsync(ApiResponse<object>.NotFoundResponse(ex.Message), ct);
            return notFound;
        }
        catch (ForbiddenException ex)
        {
            var forbidden = req.CreateResponse(HttpStatusCode.Forbidden);
            await forbidden.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(ex.Message, 403), ct);
            return forbidden;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting match {MatchId}", matchGuid);
            var error = req.CreateResponse(HttpStatusCode.InternalServerError);
            await error.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("Failed to start match", 500), ct);
            return error;
        }
    }

    /// <summary>
    /// Mark a match as completed (full time) and notify all participants.
    /// </summary>
    [Function("EndMatch")]
    [OpenApiOperation(
        operationId: "EndMatch",
        tags: new[] { "Matches" },
        Summary = "End a match",
        Description = "Sets the match status to completed and sends a full-time push notification to all players and coaches. Penalty scores are derived automatically from goals recorded in the penalties period. Caller must be a coach for the team.")]
    [OpenApiParameter(
        name: "id",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The match ID")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NoContent, Description = "Match ended and notifications sent")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Unauthorized, Description = "User not authenticated")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.Forbidden,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<object>),
        Description = "Caller is not a coach for this team")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<object>),
        Description = "Match not found")]
    public async Task<HttpResponseData> EndMatch(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "v1/matches/{id}/end")] HttpRequestData req,
        string id,
        CancellationToken ct = default)
    {
        var authId = req.GetUserId();
        if (string.IsNullOrEmpty(authId))
            return req.CreateResponse(HttpStatusCode.Unauthorized);

        if (!Guid.TryParse(id, out var matchGuid))
        {
            var bad = req.CreateResponse(HttpStatusCode.BadRequest);
            await bad.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("Invalid match ID format", 400), ct);
            return bad;
        }

        try
        {
            await _mediator.Send(new EndMatchCommand(matchGuid, authId), ct);
            return req.CreateResponse(HttpStatusCode.NoContent);
        }
        catch (NotFoundException ex)
        {
            var notFound = req.CreateResponse(HttpStatusCode.NotFound);
            await notFound.WriteAsJsonAsync(ApiResponse<object>.NotFoundResponse(ex.Message), ct);
            return notFound;
        }
        catch (ForbiddenException ex)
        {
            var forbidden = req.CreateResponse(HttpStatusCode.Forbidden);
            await forbidden.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(ex.Message, 403), ct);
            return forbidden;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error ending match {MatchId}", matchGuid);
            var error = req.CreateResponse(HttpStatusCode.InternalServerError);
            await error.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("Failed to end match", 500), ct);
            return error;
        }
    }

    /// <summary>
    /// Publish/unpublish a match report for social sharing.
    /// </summary>
    [Function("PublishMatchReport")]
    [OpenApiOperation(
        operationId: "PublishMatchReport",
        tags: new[] { "Matches" },
        Summary = "Publish or unpublish match report",
        Description = "Sets whether a match report is publicly visible at /social/match/{id}/report.")]
    [OpenApiParameter(
        name: "id",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The match ID")]
    [OpenApiRequestBody(
        contentType: "application/json",
        bodyType: typeof(PublishMatchReportRequestDto),
        Required = true,
        Description = "Publish state payload")]
    [OpenApiResponseWithoutBody(
        statusCode: HttpStatusCode.NoContent,
        Description = "Publish state updated successfully")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.BadRequest,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<object>),
        Description = "Invalid request")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<object>),
        Description = "Match or report not found")]
    public async Task<HttpResponseData> PublishMatchReport(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/matches/{id}/report/publish")] HttpRequestData req,
        string id)
    {
        var userId = req.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                "Authentication required",
                (int)HttpStatusCode.Unauthorized));
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(id, out var matchGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                "Invalid match ID format", 400));
            return badRequestResponse;
        }

        PublishMatchReportRequestDto? dto;
        try
        {
            dto = await req.ReadFromJsonAsync<PublishMatchReportRequestDto>();
            if (dto == null)
            {
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                    "Invalid request body",
                    (int)HttpStatusCode.BadRequest));
                return badRequestResponse;
            }
        }
        catch (System.Text.Json.JsonException ex)
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                "Invalid request body: " + ex.Message,
                (int)HttpStatusCode.BadRequest));
            return badRequestResponse;
        }

        try
        {
            await _mediator.Send(new PublishMatchReportCommand(matchGuid, dto));
            return req.CreateResponse(HttpStatusCode.NoContent);
        }
        catch (NotFoundException ex)
        {
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<object>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating match report publish status");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                "An error occurred while updating publish status",
                (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }

    /// <summary>
    /// Update the authenticated user's own attendance status for a match.
    /// </summary>
    [Function("UpdateMyMatchAttendance")]
    [OpenApiOperation(
        operationId: "UpdateMyMatchAttendance",
        tags: new[] { "Matches" },
        Summary = "Update my match attendance",
        Description = "Updates the authenticated user's attendance status (confirmed or declined) for a match. Players update their own record; parents supply a playerId for their child; coaches update their coach record.")]
    [OpenApiParameter(
        name: "id",
        In = ParameterLocation.Path,
        Required = true,
        Type = typeof(Guid),
        Description = "The match ID")]
    [OpenApiRequestBody(
        contentType: "application/json",
        bodyType: typeof(UpdateMyMatchAttendanceRequest),
        Required = true,
        Description = "Attendance status update")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NoContent, Description = "Attendance updated")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.Unauthorized, Description = "User not authenticated")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.NotFound,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<object>),
        Description = "Attendance record not found")]
    [OpenApiResponseWithBody(
        statusCode: HttpStatusCode.Forbidden,
        contentType: "application/json",
        bodyType: typeof(ApiResponse<object>),
        Description = "Not authorised to update this attendance record")]
    public async Task<HttpResponseData> UpdateMyMatchAttendance(
        [HttpTrigger(AuthorizationLevel.Anonymous, "patch", Route = "v1/matches/{id}/my-attendance")] HttpRequestData req,
        string id,
        CancellationToken ct = default)
    {
        var authId = req.GetUserId();
        if (string.IsNullOrEmpty(authId))
            return req.CreateResponse(HttpStatusCode.Unauthorized);

        if (!Guid.TryParse(id, out var matchGuid))
        {
            var bad = req.CreateResponse(HttpStatusCode.BadRequest);
            await bad.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("Invalid match ID format", 400), ct);
            return bad;
        }

        UpdateMyMatchAttendanceRequest? body;
        try
        {
            body = await req.ReadFromJsonAsync<UpdateMyMatchAttendanceRequest>();
        }
        catch (System.Text.Json.JsonException)
        {
            var bad = req.CreateResponse(HttpStatusCode.BadRequest);
            await bad.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("Invalid request body", 400), ct);
            return bad;
        }

        if (body == null || string.IsNullOrWhiteSpace(body.Status) ||
            (body.Status != "confirmed" && body.Status != "declined"))
        {
            var bad = req.CreateResponse(HttpStatusCode.BadRequest);
            await bad.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("Status must be 'confirmed' or 'declined'", 400), ct);
            return bad;
        }

        try
        {
            await _mediator.Send(new UpdateMyMatchAttendanceCommand(matchGuid, authId, body.Status, body.PlayerId), ct);
            return req.CreateResponse(HttpStatusCode.NoContent);
        }
        catch (NotFoundException ex)
        {
            var notFound = req.CreateResponse(HttpStatusCode.NotFound);
            await notFound.WriteAsJsonAsync(ApiResponse<object>.NotFoundResponse(ex.Message), ct);
            return notFound;
        }
        catch (ForbiddenException ex)
        {
            var forbidden = req.CreateResponse(HttpStatusCode.Forbidden);
            await forbidden.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(ex.Message, 403), ct);
            return forbidden;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating match attendance for {MatchId}", matchGuid);
            var error = req.CreateResponse(HttpStatusCode.InternalServerError);
            await error.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse("An error occurred", 500), ct);
            return error;
        }
    }
}

public class UpdateMyMatchAttendanceRequest
{
    public string Status { get; set; } = string.Empty;
    public Guid? PlayerId { get; set; }
}

public class PublishedMatchReportDto
{
    public Guid MatchId { get; set; }
    public Guid ClubId { get; set; }
    public string ClubName { get; set; } = string.Empty;
    public string? ClubLogo { get; set; }
    public string? ClubPrimaryColor { get; set; }
    public string? ClubSecondaryColor { get; set; }
    public string TeamName { get; set; } = string.Empty;
    public string Opposition { get; set; } = string.Empty;
    public DateTime MatchDate { get; set; }
    public string Competition { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public bool IsHome { get; set; }
    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }
    public string? Summary { get; set; }
    public string? PlayerOfMatchName { get; set; }
    public string? PlayerOfMatchPhoto { get; set; }
    public List<PublishedGoalDto> Goals { get; set; } = new();
    public List<PublishedCardDto> Cards { get; set; } = new();
    public List<PublishedLineupPlayerDto> StartingPlayers { get; set; } = new();
    public List<PublishedLineupPlayerDto> Substitutes { get; set; } = new();
    public string OgTitle { get; set; } = string.Empty;
    public string OgDescription { get; set; } = string.Empty;
    public string? OgImage { get; set; }
}

public record PublishedGoalDto(string ScorerName, int? Minute, bool IsPenalty, string? Period);
public record PublishedCardDto(string PlayerName, string Type, int? Minute, string? Period);
public record PublishedLineupPlayerDto(string FirstName, string LastName, string? Position, int? SquadNumber);
