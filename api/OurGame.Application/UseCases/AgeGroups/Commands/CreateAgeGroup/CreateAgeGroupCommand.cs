using MediatR;
using Microsoft.EntityFrameworkCore;
using OurGame.Application.Abstractions.Exceptions;
using OurGame.Application.UseCases.AgeGroups.Commands.CreateAgeGroup.DTOs;
using OurGame.Application.UseCases.AgeGroups.Queries.GetAgeGroupById.DTOs;
using OurGame.Persistence.Enums;
using OurGame.Persistence.Models;

namespace OurGame.Application.UseCases.AgeGroups.Commands.CreateAgeGroup;

/// <summary>
/// Command to create a new age group.
/// </summary>
public record CreateAgeGroupCommand(CreateAgeGroupDto Dto) : IRequest<AgeGroupDetailDto>;

/// <summary>
/// Handler for creating a new age group.
/// </summary>
public class CreateAgeGroupHandler : IRequestHandler<CreateAgeGroupCommand, AgeGroupDetailDto>
{
    private readonly OurGameContext _db;

    public CreateAgeGroupHandler(OurGameContext db)
    {
        _db = db;
    }

    public async Task<AgeGroupDetailDto> Handle(CreateAgeGroupCommand command, CancellationToken cancellationToken)
    {
        var dto = command.Dto;

        // Validate ClubId exists
        var clubExists = await _db.Clubs.AnyAsync(c => c.Id == dto.ClubId, cancellationToken);
        if (!clubExists)
        {
            throw new NotFoundException("Club", dto.ClubId.ToString());
        }

        // Parse and validate Level
        if (!Enum.TryParse<Level>(dto.Level, ignoreCase: true, out var level))
        {
            throw new Abstractions.Exceptions.ValidationException("Level",
                "Invalid level. Must be one of: youth, amateur, reserve, senior.");
        }

        // Validate SquadSize
        if (!System.Enum.IsDefined(typeof(SquadSize), dto.DefaultSquadSize))
        {
            throw new Abstractions.Exceptions.ValidationException("DefaultSquadSize",
                "Invalid squad size. Must be one of: 4, 5, 7, 9, 11.");
        }

        var squadSize = (int)(SquadSize)dto.DefaultSquadSize;
        var levelInt = (int)level;
        var newId = Guid.NewGuid();
        var now = DateTime.UtcNow;
        var description = dto.Description ?? string.Empty;

        // Insert using parameterized SQL
        await _db.Database.ExecuteSqlInterpolatedAsync($@"
            INSERT INTO AgeGroups (Id, ClubId, Name, Code, Level, CurrentSeason, Seasons, DefaultSeason, DefaultSquadSize, Description, IsArchived, CreatedAt, UpdatedAt)
            VALUES ({newId}, {dto.ClubId}, {dto.Name}, {dto.Code}, {levelInt}, {dto.Season}, {dto.Season}, {dto.Season}, {squadSize}, {description}, {false}, {now}, {now})
        ", cancellationToken);

        // Query back the created age group using existing pattern
        var result = await _db.Database
            .SqlQueryRaw<AgeGroupRawResult>(@"
                SELECT 
                    ag.Id,
                    ag.ClubId,
                    ag.Name,
                    ag.Code,
                    ag.Level,
                    ag.CurrentSeason,
                    ag.Seasons,
                    ag.DefaultSeason,
                    ag.DefaultSquadSize,
                    ag.Description,
                    ag.IsArchived
                FROM AgeGroups ag
                WHERE ag.Id = {0}
            ", newId)
            .FirstOrDefaultAsync(cancellationToken);

        if (result == null)
        {
            throw new Exception("Failed to retrieve created age group.");
        }

        var levelName = System.Enum.GetName(typeof(Level), result.Level) ?? Level.Youth.ToString();

        return new AgeGroupDetailDto
        {
            Id = result.Id,
            ClubId = result.ClubId,
            Name = result.Name ?? string.Empty,
            Code = result.Code ?? string.Empty,
            Level = levelName.ToLowerInvariant(),
            Season = result.CurrentSeason ?? string.Empty,
            Seasons = result.Seasons != null
                ? result.Seasons.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(s => s.Trim()).ToList()
                : new List<string>(),
            DefaultSeason = result.DefaultSeason ?? string.Empty,
            DefaultSquadSize = result.DefaultSquadSize,
            Description = result.Description,
            IsArchived = result.IsArchived
        };
    }
}

/// <summary>
/// Raw SQL query result model for age group data.
/// </summary>
internal class AgeGroupRawResult
{
    public Guid Id { get; set; }
    public Guid ClubId { get; set; }
    public string? Name { get; set; }
    public string? Code { get; set; }
    public int Level { get; set; }
    public string? CurrentSeason { get; set; }
    public string? Seasons { get; set; }
    public string? DefaultSeason { get; set; }
    public int DefaultSquadSize { get; set; }
    public string? Description { get; set; }
    public bool IsArchived { get; set; }
}
