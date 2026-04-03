using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.Clubs.Commands.UpdateClubById.DTOs;

public record UpdateClubMediaLinkDto
{
    public Guid? Id { get; init; }

    [Required]
    [StringLength(500)]
    public string Url { get; init; } = string.Empty;

    [StringLength(200)]
    public string? Title { get; init; }

    [Required]
    [StringLength(50)]
    public string Type { get; init; } = "other";

    public bool IsPublic { get; init; } = false;
}
