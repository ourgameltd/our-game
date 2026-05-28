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

    [Required]
    [StringLength(50)]
    public string Role { get; init; } = string.Empty;

    [StringLength(2000)]
    public string? Biography { get; init; }

    public string[] Specializations { get; init; } = Array.Empty<string>();

    public Guid[] TeamIds { get; init; } = Array.Empty<Guid>();

    public string? Photo { get; init; }
}
