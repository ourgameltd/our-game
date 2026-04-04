using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using OurGame.Api.Attributes;
using OurGame.Api.Extensions;
using OurGame.Application.UseCases.Users.Queries.GetUserRoles;
using System.Net;

namespace OurGame.Api.Functions;

public class GetRolesFunctions
{
    private readonly IMediator _mediator;
    private readonly ILogger<GetRolesFunctions> _logger;

    public GetRolesFunctions(IMediator mediator, ILogger<GetRolesFunctions> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// SWA rolesSource endpoint. Called by Azure Static Web Apps after authentication
    /// to assign custom roles based on the user's database record.
    /// </summary>
    [Function("GetRoles")]
    [AllowAnonymousEndpoint]
    public async Task<HttpResponseData> GetRoles(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "GetRoles")] HttpRequestData req)
    {
        var userId = req.GetUserId();

        if (string.IsNullOrEmpty(userId))
        {
            return await WriteRolesResponse(req, Array.Empty<string>());
        }

        try
        {
            var roles = await _mediator.Send(new GetUserRolesQuery(userId));
            return await WriteRolesResponse(req, roles);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error looking up roles for user {UserId}", userId);
            return await WriteRolesResponse(req, Array.Empty<string>());
        }
    }

    private static async Task<HttpResponseData> WriteRolesResponse(
        HttpRequestData req, IEnumerable<string> roles)
    {
        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(new { roles });
        return response;
    }
}
