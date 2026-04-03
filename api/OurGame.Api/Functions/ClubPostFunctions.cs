using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using OurGame.Api.Attributes;
using OurGame.Api.Extensions;
using OurGame.Application.Abstractions.Responses;
using OurGame.Application.UseCases.Clubs.Queries.GetClubPosts;
using OurGame.Application.UseCases.Clubs.Queries.GetClubPosts.DTOs;
using OurGame.Application.UseCases.Clubs.Commands.CreateClubPost;
using OurGame.Application.UseCases.Clubs.Commands.CreateClubPost.DTOs;
using OurGame.Application.UseCases.Clubs.Commands.UpdateClubPost;
using OurGame.Application.UseCases.Clubs.Commands.UpdateClubPost.DTOs;
using OurGame.Application.UseCases.Clubs.Commands.DeleteClubPost;
using OurGame.Application.UseCases.Clubs.Queries.GetPublicClubPostById;
using OurGame.Application.UseCases.Clubs.Queries.GetPublicClubPostById.DTOs;
using System.Net;

namespace OurGame.Api.Functions;

/// <summary>
/// Azure Functions for Club Post endpoints
/// </summary>
public class ClubPostFunctions
{
    private readonly IMediator _mediator;
    private readonly ILogger<ClubPostFunctions> _logger;

    public ClubPostFunctions(IMediator mediator, ILogger<ClubPostFunctions> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get all posts for a specific club
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="clubId">The club ID</param>
    /// <returns>List of club posts</returns>
    [Function("GetClubPosts")]
    [OpenApiOperation(operationId: "GetClubPosts", tags: new[] { "Clubs" }, Summary = "Get club posts", Description = "Retrieves all posts for a specific club")]
    [OpenApiParameter(name: "clubId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The club ID")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<List<ClubPostDto>>), Description = "Posts retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<List<ClubPostDto>>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<List<ClubPostDto>>), Description = "Invalid club ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<List<ClubPostDto>>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetClubPosts(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/clubs/{clubId}/posts")] HttpRequestData req,
        string clubId)
    {
        var azureUserId = req.GetUserId();

        if (string.IsNullOrEmpty(azureUserId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(clubId, out var clubGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<List<ClubPostDto>>.ErrorResponse(
                "Invalid club ID format", 400));
            return badRequestResponse;
        }

        var posts = await _mediator.Send(new GetClubPostsQuery(clubGuid));

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<List<ClubPostDto>>.SuccessResponse(posts));
        return response;
    }

    /// <summary>
    /// Create a new post for a club
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="clubId">The club ID</param>
    /// <returns>The created club post</returns>
    [Function("CreateClubPost")]
    [OpenApiOperation(operationId: "CreateClubPost", tags: new[] { "Clubs" }, Summary = "Create club post", Description = "Creates a new post for a specific club")]
    [OpenApiParameter(name: "clubId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The club ID")]
    [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(CreateClubPostRequestDto), Required = true, Description = "Post details")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Created, contentType: "application/json", bodyType: typeof(ApiResponse<ClubPostDto>), Description = "Post created successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<ClubPostDto>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<ClubPostDto>), Description = "Invalid request data")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<ClubPostDto>), Description = "Validation error")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<ClubPostDto>), Description = "Internal server error")]
    public async Task<HttpResponseData> CreateClubPost(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "v1/clubs/{clubId}/posts")] HttpRequestData req,
        string clubId)
    {
        var azureUserId = req.GetUserId();

        if (string.IsNullOrEmpty(azureUserId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(clubId, out var clubGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<ClubPostDto>.ErrorResponse(
                "Invalid club ID format", 400));
            return badRequestResponse;
        }

        try
        {
            var dto = await req.ReadFromJsonAsync<CreateClubPostRequestDto>();
            if (dto == null)
            {
                _logger.LogWarning("Failed to deserialize CreateClubPostRequestDto");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteAsJsonAsync(ApiResponse<ClubPostDto>.ErrorResponse(
                    "Invalid request body",
                    (int)HttpStatusCode.BadRequest));
                return badRequestResponse;
            }

            var command = new CreateClubPostCommand(clubGuid, dto);
            var result = await _mediator.Send(command);

            _logger.LogInformation("Club post created successfully: {PostId} for club {ClubId}", result.Id, clubGuid);
            var successResponse = req.CreateResponse(HttpStatusCode.Created);
            successResponse.Headers.Add("Location", $"/v1/clubs/{clubGuid}/posts/{result.Id}");
            await successResponse.WriteAsJsonAsync(ApiResponse<ClubPostDto>.SuccessResponse(result, (int)HttpStatusCode.Created));
            return successResponse;
        }
        catch (OurGame.Application.Abstractions.Exceptions.NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found during CreateClubPost");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<ClubPostDto>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (OurGame.Application.Abstractions.Exceptions.ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error during CreateClubPost");
            var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await validationResponse.WriteAsJsonAsync(ApiResponse<ClubPostDto>.ValidationErrorResponse(
                "Validation failed",
                ex.Errors));
            return validationResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating club post");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<ClubPostDto>.ErrorResponse(
                "An error occurred while creating the club post",
                (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }

    /// <summary>
    /// Update an existing club post
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="clubId">The club ID</param>
    /// <param name="postId">The post ID</param>
    /// <returns>The updated club post</returns>
    [Function("UpdateClubPost")]
    [OpenApiOperation(operationId: "UpdateClubPost", tags: new[] { "Clubs" }, Summary = "Update club post", Description = "Updates an existing post for a specific club")]
    [OpenApiParameter(name: "clubId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The club ID")]
    [OpenApiParameter(name: "postId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The post ID")]
    [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(UpdateClubPostRequestDto), Required = true, Description = "Updated post details")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<ClubPostDto>), Description = "Post updated successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<ClubPostDto>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<ClubPostDto>), Description = "Invalid request data")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse<ClubPostDto>), Description = "Club or post not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<ClubPostDto>), Description = "Validation error")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<ClubPostDto>), Description = "Internal server error")]
    public async Task<HttpResponseData> UpdateClubPost(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/clubs/{clubId}/posts/{postId}")] HttpRequestData req,
        string clubId,
        string postId)
    {
        var azureUserId = req.GetUserId();

        if (string.IsNullOrEmpty(azureUserId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(clubId, out var clubGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<ClubPostDto>.ErrorResponse(
                "Invalid club ID format", 400));
            return badRequestResponse;
        }

        if (!Guid.TryParse(postId, out var postGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<ClubPostDto>.ErrorResponse(
                "Invalid post ID format", 400));
            return badRequestResponse;
        }

        try
        {
            var dto = await req.ReadFromJsonAsync<UpdateClubPostRequestDto>();
            if (dto == null)
            {
                _logger.LogWarning("Failed to deserialize UpdateClubPostRequestDto");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteAsJsonAsync(ApiResponse<ClubPostDto>.ErrorResponse(
                    "Invalid request body",
                    (int)HttpStatusCode.BadRequest));
                return badRequestResponse;
            }

            var command = new UpdateClubPostCommand(clubGuid, postGuid, dto);
            var result = await _mediator.Send(command);

            _logger.LogInformation("Club post updated successfully: {PostId} for club {ClubId}", postGuid, clubGuid);
            var successResponse = req.CreateResponse(HttpStatusCode.OK);
            await successResponse.WriteAsJsonAsync(ApiResponse<ClubPostDto>.SuccessResponse(result));
            return successResponse;
        }
        catch (OurGame.Application.Abstractions.Exceptions.NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found during UpdateClubPost");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<ClubPostDto>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (OurGame.Application.Abstractions.Exceptions.ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error during UpdateClubPost");
            var validationResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await validationResponse.WriteAsJsonAsync(ApiResponse<ClubPostDto>.ValidationErrorResponse(
                "Validation failed",
                ex.Errors));
            return validationResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating club post");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<ClubPostDto>.ErrorResponse(
                "An error occurred while updating the club post",
                (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }

    /// <summary>
    /// Delete a club post
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="clubId">The club ID</param>
    /// <param name="postId">The post ID</param>
    /// <returns>No content on success</returns>
    [Function("DeleteClubPost")]
    [OpenApiOperation(operationId: "DeleteClubPost", tags: new[] { "Clubs" }, Summary = "Delete club post", Description = "Deletes a post from a specific club")]
    [OpenApiParameter(name: "clubId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The club ID")]
    [OpenApiParameter(name: "postId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The post ID")]
    [OpenApiResponseWithoutBody(statusCode: HttpStatusCode.NoContent, Description = "Post deleted successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "User not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Invalid ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Club or post not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<object>), Description = "Internal server error")]
    public async Task<HttpResponseData> DeleteClubPost(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "v1/clubs/{clubId}/posts/{postId}")] HttpRequestData req,
        string clubId,
        string postId)
    {
        var azureUserId = req.GetUserId();

        if (string.IsNullOrEmpty(azureUserId))
        {
            var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
            return unauthorizedResponse;
        }

        if (!Guid.TryParse(clubId, out var clubGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                "Invalid club ID format", 400));
            return badRequestResponse;
        }

        if (!Guid.TryParse(postId, out var postGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                "Invalid post ID format", 400));
            return badRequestResponse;
        }

        try
        {
            var command = new DeleteClubPostCommand(clubGuid, postGuid);
            await _mediator.Send(command);

            _logger.LogInformation("Club post deleted successfully: {PostId} for club {ClubId}", postGuid, clubGuid);
            var successResponse = req.CreateResponse(HttpStatusCode.NoContent);
            return successResponse;
        }
        catch (OurGame.Application.Abstractions.Exceptions.NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found during DeleteClubPost");
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<object>.NotFoundResponse(ex.Message));
            return notFoundResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting club post");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(ApiResponse<object>.ErrorResponse(
                "An error occurred while deleting the club post",
                (int)HttpStatusCode.InternalServerError));
            return errorResponse;
        }
    }

    /// <summary>
    /// Get a publicly shareable club post (no authentication required)
    /// </summary>
    /// <param name="req">The HTTP request</param>
    /// <param name="postId">The post ID</param>
    /// <returns>Public club post details</returns>
    [Function("GetPublicPost")]
    [AllowAnonymousEndpoint]
    [OpenApiOperation(operationId: "GetPublicPost", tags: new[] { "Clubs" }, Summary = "Get public post", Description = "Retrieves a publicly shareable club post. No authentication required.")]
    [OpenApiParameter(name: "postId", In = ParameterLocation.Path, Required = true, Type = typeof(Guid), Description = "The post ID")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(ApiResponse<PublicClubPostDto>), Description = "Post retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ApiResponse<PublicClubPostDto>), Description = "Invalid post ID format")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(ApiResponse<PublicClubPostDto>), Description = "Post not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ApiResponse<PublicClubPostDto>), Description = "Internal server error")]
    public async Task<HttpResponseData> GetPublicPost(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/public/posts/{postId}")] HttpRequestData req,
        string postId)
    {
        if (!Guid.TryParse(postId, out var postGuid))
        {
            var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(ApiResponse<PublicClubPostDto>.ErrorResponse(
                "Invalid post ID format", 400));
            return badRequestResponse;
        }

        var post = await _mediator.Send(new GetPublicClubPostByIdQuery(postGuid));

        if (post == null)
        {
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(ApiResponse<PublicClubPostDto>.NotFoundResponse(
                "Post not found"));
            return notFoundResponse;
        }

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(ApiResponse<PublicClubPostDto>.SuccessResponse(post));
        return response;
    }
}
