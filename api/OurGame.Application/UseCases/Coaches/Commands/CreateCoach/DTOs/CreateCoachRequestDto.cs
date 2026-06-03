using System.ComponentModel.DataAnnotations;

namespace OurGame.Application.UseCases.Coaches.Commands.CreateCoach.DTOs;

public record CreateCoachRequestDto
{
    [Required]
    [StringLength(100)]
    public string FirstName { get; init; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string LastName { get; init; } = string.Empty;

    [StringLength(20)]
    public string? Phone { get; init; }

    public DateOnly? DateOfBirth { get; init; }

    [StringLength(50)]
    public string? AssociationId { get; init; }

    [StringLength(2000)]
    public string? Biography { get; init; }

    public string[] Specializations { get; init; } = Array.Empty<string>();

    public string[] ClubRoles { get; init; } = Array.Empty<string>();

    public string[] Badges { get; init; } = Array.Empty<string>();

    public Guid[] TeamIds { get; init; } = Array.Empty<Guid>();

    public string? Photo { get; init; }
}
