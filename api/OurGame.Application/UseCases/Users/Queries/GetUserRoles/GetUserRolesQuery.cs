using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Users.Queries.GetUserRoles;

public record GetUserRolesQuery(string AuthId) : IRequest<List<string>>;

public class GetUserRolesHandler : IRequestHandler<GetUserRolesQuery, List<string>>
{
    private readonly OurGameContext _db;

    public GetUserRolesHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<List<string>> Handle(GetUserRolesQuery request, CancellationToken cancellationToken)
    {
        var roles = new List<string>();

        var isAdmin = await _db.Database
            .SqlQuery<bool>($"SELECT CAST(IsAdmin AS BIT) AS [Value] FROM Users WHERE AuthId = {request.AuthId}")
            .FirstOrDefaultAsync(cancellationToken);

        if (isAdmin)
        {
            roles.Add("admin");
        }

        return roles;
    }
}
