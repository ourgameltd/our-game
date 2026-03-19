using MediatR;
using OurGame.Application.UseCases.Formations.Queries.GetSystemFormations.DTOs;

namespace OurGame.Application.UseCases.Formations.Queries.GetSystemFormations;

/// <summary>
/// Query to retrieve all read-only system formations.
/// </summary>
public record GetSystemFormationsQuery : IRequest<List<SystemFormationDto>>;