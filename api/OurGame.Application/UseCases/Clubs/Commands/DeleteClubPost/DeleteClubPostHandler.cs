using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.Clubs.Commands.DeleteClubPost;

/// <summary>
/// Command to delete a club post.
/// </summary>
public record DeleteClubPostCommand(Guid ClubId, Guid PostId) : IRequest;

/// <summary>
/// Handler for DeleteClubPostCommand.
/// Validates the post belongs to the club, then deletes it.
/// </summary>
public class DeleteClubPostHandler : IRequestHandler<DeleteClubPostCommand>
{
    private readonly OurGameContext _db;

    public DeleteClubPostHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task Handle(DeleteClubPostCommand command, CancellationToken cancellationToken)
    {
        var clubId = command.ClubId;
        var postId = command.PostId;

        // 1. Verify the post exists and belongs to this club
        var existing = await _db.Database
            .SqlQueryRaw<PostCheckResult>(
                "SELECT Id, ClubId FROM ClubPosts WHERE Id = {0}", postId)
            .FirstOrDefaultAsync(cancellationToken);

        if (existing == null || existing.ClubId != clubId)
        {
            throw new NotFoundException("ClubPost", postId.ToString());
        }

        // 2. Delete the post
        var rowsAffected = await _db.Database.ExecuteSqlInterpolatedAsync($@"
            DELETE FROM ClubPosts WHERE Id = {postId} AND ClubId = {clubId}
        ", cancellationToken);

        if (rowsAffected == 0)
        {
            throw new NotFoundException("ClubPost", postId.ToString());
        }
    }
}

internal class PostCheckResult
{
    public Guid Id { get; set; }
    public Guid ClubId { get; set; }
}
