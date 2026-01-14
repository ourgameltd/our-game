using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OurGame.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "clubs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ShortName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Logo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PrimaryColor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SecondaryColor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AccentColor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    City = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Country = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Venue = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FoundedYear = table.Column<int>(type: "int", nullable: true),
                    History = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Ethos = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Principles = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_clubs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "age_groups",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClubId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Code = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Level = table.Column<int>(type: "int", nullable: false),
                    CurrentSeason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Seasons = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DefaultSeason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DefaultSquadSize = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsArchived = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_age_groups", x => x.Id);
                    table.ForeignKey(
                        name: "FK_age_groups_clubs_ClubId",
                        column: x => x.ClubId,
                        principalTable: "clubs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "coaches",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClubId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DateOfBirth = table.Column<DateOnly>(type: "date", nullable: true),
                    Photo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AssociationId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HasAccount = table.Column<bool>(type: "bit", nullable: false),
                    Role = table.Column<int>(type: "int", nullable: false),
                    Biography = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Specializations = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsArchived = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_coaches", x => x.Id);
                    table.ForeignKey(
                        name: "FK_coaches_clubs_ClubId",
                        column: x => x.ClubId,
                        principalTable: "clubs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "players",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClubId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Nickname = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DateOfBirth = table.Column<DateOnly>(type: "date", nullable: true),
                    Photo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AssociationId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PreferredPositions = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OverallRating = table.Column<int>(type: "int", nullable: true),
                    Allergies = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MedicalConditions = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsArchived = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_players", x => x.Id);
                    table.ForeignKey(
                        name: "FK_players_clubs_ClubId",
                        column: x => x.ClubId,
                        principalTable: "clubs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    first_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    last_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    role = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    club_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    player_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    staff_id = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    photo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    preferences = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.id);
                    table.ForeignKey(
                        name: "FK_users_clubs",
                        column: x => x.club_id,
                        principalTable: "clubs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AgeGroupCoordinators",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AgeGroupId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CoachId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AgeGroupCoordinators", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AgeGroupCoordinators_age_groups_AgeGroupId",
                        column: x => x.AgeGroupId,
                        principalTable: "age_groups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AgeGroupCoordinators_coaches_CoachId",
                        column: x => x.CoachId,
                        principalTable: "coaches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "drills",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DurationMinutes = table.Column<int>(type: "int", nullable: true),
                    Category = table.Column<int>(type: "int", nullable: false),
                    Attributes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Equipment = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Diagram = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Instructions = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Variations = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClubId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsPublic = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByNavigationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_drills", x => x.Id);
                    table.ForeignKey(
                        name: "FK_drills_clubs_ClubId",
                        column: x => x.ClubId,
                        principalTable: "clubs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_drills_coaches_CreatedByNavigationId",
                        column: x => x.CreatedByNavigationId,
                        principalTable: "coaches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DrillTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AggregatedAttributes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TotalDuration = table.Column<int>(type: "int", nullable: true),
                    Category = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClubId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsPublic = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByNavigationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DrillTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DrillTemplates_clubs_ClubId",
                        column: x => x.ClubId,
                        principalTable: "clubs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DrillTemplates_coaches_CreatedByNavigationId",
                        column: x => x.CreatedByNavigationId,
                        principalTable: "coaches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "formations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    System = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SquadSize = table.Column<int>(type: "int", nullable: false),
                    IsSystemFormation = table.Column<bool>(type: "bit", nullable: false),
                    ParentFormationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ParentTacticId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Summary = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Style = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ScopeType = table.Column<int>(type: "int", nullable: false),
                    ScopeClubId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ScopeAgeGroupId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ScopeTeamId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Tags = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByNavigationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_formations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_formations_clubs_ScopeClubId",
                        column: x => x.ScopeClubId,
                        principalTable: "clubs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_formations_coaches_CreatedByNavigationId",
                        column: x => x.CreatedByNavigationId,
                        principalTable: "coaches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_formations_formations_ParentFormationId",
                        column: x => x.ParentFormationId,
                        principalTable: "formations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_formations_formations_ParentTacticId",
                        column: x => x.ParentTacticId,
                        principalTable: "formations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AttributeEvaluations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlayerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EvaluatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EvaluatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    OverallRating = table.Column<int>(type: "int", nullable: true),
                    CoachNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PeriodStart = table.Column<DateOnly>(type: "date", nullable: true),
                    PeriodEnd = table.Column<DateOnly>(type: "date", nullable: true),
                    EvaluatedByNavigationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AttributeEvaluations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AttributeEvaluations_coaches_EvaluatedByNavigationId",
                        column: x => x.EvaluatedByNavigationId,
                        principalTable: "coaches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AttributeEvaluations_players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EmergencyContacts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlayerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Relationship = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsPrimary = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmergencyContacts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmergencyContacts_players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "player_age_groups",
                columns: table => new
                {
                    PlayerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AgeGroupId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_player_age_groups", x => new { x.PlayerId, x.AgeGroupId });
                    table.ForeignKey(
                        name: "FK_player_age_groups_age_groups_AgeGroupId",
                        column: x => x.AgeGroupId,
                        principalTable: "age_groups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_player_age_groups_players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "player_attributes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlayerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BallControl = table.Column<int>(type: "int", nullable: true),
                    Crossing = table.Column<int>(type: "int", nullable: true),
                    WeakFoot = table.Column<int>(type: "int", nullable: true),
                    Dribbling = table.Column<int>(type: "int", nullable: true),
                    Finishing = table.Column<int>(type: "int", nullable: true),
                    FreeKick = table.Column<int>(type: "int", nullable: true),
                    Heading = table.Column<int>(type: "int", nullable: true),
                    LongPassing = table.Column<int>(type: "int", nullable: true),
                    LongShot = table.Column<int>(type: "int", nullable: true),
                    Penalties = table.Column<int>(type: "int", nullable: true),
                    ShortPassing = table.Column<int>(type: "int", nullable: true),
                    ShotPower = table.Column<int>(type: "int", nullable: true),
                    SlidingTackle = table.Column<int>(type: "int", nullable: true),
                    StandingTackle = table.Column<int>(type: "int", nullable: true),
                    Volleys = table.Column<int>(type: "int", nullable: true),
                    Acceleration = table.Column<int>(type: "int", nullable: true),
                    Agility = table.Column<int>(type: "int", nullable: true),
                    Balance = table.Column<int>(type: "int", nullable: true),
                    Jumping = table.Column<int>(type: "int", nullable: true),
                    Pace = table.Column<int>(type: "int", nullable: true),
                    Reactions = table.Column<int>(type: "int", nullable: true),
                    SprintSpeed = table.Column<int>(type: "int", nullable: true),
                    Stamina = table.Column<int>(type: "int", nullable: true),
                    Strength = table.Column<int>(type: "int", nullable: true),
                    Aggression = table.Column<int>(type: "int", nullable: true),
                    AttackingPosition = table.Column<int>(type: "int", nullable: true),
                    Awareness = table.Column<int>(type: "int", nullable: true),
                    Communication = table.Column<int>(type: "int", nullable: true),
                    Composure = table.Column<int>(type: "int", nullable: true),
                    DefensivePositioning = table.Column<int>(type: "int", nullable: true),
                    Interceptions = table.Column<int>(type: "int", nullable: true),
                    Marking = table.Column<int>(type: "int", nullable: true),
                    Positivity = table.Column<int>(type: "int", nullable: true),
                    Positioning = table.Column<int>(type: "int", nullable: true),
                    Vision = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_player_attributes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_player_attributes_players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "player_reports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlayerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PeriodStart = table.Column<DateOnly>(type: "date", nullable: true),
                    PeriodEnd = table.Column<DateOnly>(type: "date", nullable: true),
                    OverallRating = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Strengths = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AreasForImprovement = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CoachComments = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByNavigationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_player_reports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_player_reports_coaches_CreatedByNavigationId",
                        column: x => x.CreatedByNavigationId,
                        principalTable: "coaches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_player_reports_players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TrainingPlans",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlayerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    PeriodStart = table.Column<DateOnly>(type: "date", nullable: true),
                    PeriodEnd = table.Column<DateOnly>(type: "date", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByNavigationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrainingPlans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TrainingPlans_coaches_CreatedByNavigationId",
                        column: x => x.CreatedByNavigationId,
                        principalTable: "coaches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TrainingPlans_players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PlayerImages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlayerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Url = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Caption = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhotoDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UploadedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Tags = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UploadedByNavigationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlayerImages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlayerImages_players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PlayerImages_users_UploadedByNavigationId",
                        column: x => x.UploadedByNavigationId,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PlayerParents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlayerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ParentUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlayerParents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlayerParents_players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PlayerParents_users_ParentUserId",
                        column: x => x.ParentUserId,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DrillLinks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DrillId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Url = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Type = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DrillLinks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DrillLinks_drills_DrillId",
                        column: x => x.DrillId,
                        principalTable: "drills",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "template_drills",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TemplateId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DrillId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DrillOrder = table.Column<int>(type: "int", nullable: false),
                    DrillId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_template_drills", x => x.Id);
                    table.ForeignKey(
                        name: "FK_template_drills_DrillTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "DrillTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_template_drills_drills_DrillId",
                        column: x => x.DrillId,
                        principalTable: "drills",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_template_drills_drills_DrillId1",
                        column: x => x.DrillId1,
                        principalTable: "drills",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "formation_positions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FormationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Position = table.Column<int>(type: "int", nullable: false),
                    XCoord = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    YCoord = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Direction = table.Column<int>(type: "int", nullable: true),
                    PositionIndex = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_formation_positions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_formation_positions_formations_FormationId",
                        column: x => x.FormationId,
                        principalTable: "formations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PositionOverrides",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FormationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PositionIndex = table.Column<int>(type: "int", nullable: false),
                    XCoord = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    YCoord = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Direction = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PositionOverrides", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PositionOverrides_formations_FormationId",
                        column: x => x.FormationId,
                        principalTable: "formations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "tactic_principles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FormationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PositionIndices = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FormationId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tactic_principles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tactic_principles_formations_FormationId",
                        column: x => x.FormationId,
                        principalTable: "formations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tactic_principles_formations_FormationId1",
                        column: x => x.FormationId1,
                        principalTable: "formations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "teams",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClubId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AgeGroupId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ShortName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Level = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Season = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FormationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    PrimaryColor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SecondaryColor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsArchived = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_teams", x => x.Id);
                    table.ForeignKey(
                        name: "FK_teams_age_groups_AgeGroupId",
                        column: x => x.AgeGroupId,
                        principalTable: "age_groups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_teams_clubs_ClubId",
                        column: x => x.ClubId,
                        principalTable: "clubs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_teams_formations_FormationId",
                        column: x => x.FormationId,
                        principalTable: "formations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EvaluationAttributes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EvaluationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AttributeName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Rating = table.Column<int>(type: "int", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EvaluationAttributes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EvaluationAttributes_AttributeEvaluations_EvaluationId",
                        column: x => x.EvaluationId,
                        principalTable: "AttributeEvaluations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "development_plans",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlayerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PeriodStart = table.Column<DateOnly>(type: "date", nullable: true),
                    PeriodEnd = table.Column<DateOnly>(type: "date", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CoachNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LinkedReportId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByNavigationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_development_plans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_development_plans_coaches_CreatedByNavigationId",
                        column: x => x.CreatedByNavigationId,
                        principalTable: "coaches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_development_plans_player_reports_LinkedReportId",
                        column: x => x.LinkedReportId,
                        principalTable: "player_reports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_development_plans_players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ReportDevelopmentActions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReportId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Goal = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Actions = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: true),
                    TargetDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Completed = table.Column<bool>(type: "bit", nullable: false),
                    CompletedDate = table.Column<DateOnly>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReportDevelopmentActions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReportDevelopmentActions_player_reports_ReportId",
                        column: x => x.ReportId,
                        principalTable: "player_reports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SimilarProfessionals",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReportId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Team = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Position = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Reason = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SimilarProfessionals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SimilarProfessionals_player_reports_ReportId",
                        column: x => x.ReportId,
                        principalTable: "player_reports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PersonalSessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlanId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SessionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FocusAreas = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Completed = table.Column<bool>(type: "bit", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PersonalSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PersonalSessions_TrainingPlans_PlanId",
                        column: x => x.PlanId,
                        principalTable: "TrainingPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProgressNotes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlanId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NoteDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AddedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    AddedByNavigationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProgressNotes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProgressNotes_TrainingPlans_PlanId",
                        column: x => x.PlanId,
                        principalTable: "TrainingPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProgressNotes_coaches_AddedByNavigationId",
                        column: x => x.AddedByNavigationId,
                        principalTable: "coaches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TrainingObjectives",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlanId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: true),
                    TargetDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Progress = table.Column<int>(type: "int", nullable: true),
                    Completed = table.Column<bool>(type: "bit", nullable: false),
                    CompletedDate = table.Column<DateOnly>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrainingObjectives", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TrainingObjectives_TrainingPlans_PlanId",
                        column: x => x.PlanId,
                        principalTable: "TrainingPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "KitOrders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlayerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TeamId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    OrderedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    OrderedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    OrderedByNavigationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KitOrders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_KitOrders_players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_KitOrders_teams_TeamId",
                        column: x => x.TeamId,
                        principalTable: "teams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_KitOrders_users_OrderedByNavigationId",
                        column: x => x.OrderedByNavigationId,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "kits",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClubId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TeamId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Type = table.Column<int>(type: "int", nullable: false),
                    ShirtColor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ShortsColor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SocksColor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Season = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_kits", x => x.Id);
                    table.ForeignKey(
                        name: "FK_kits_clubs_ClubId",
                        column: x => x.ClubId,
                        principalTable: "clubs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_kits_teams_TeamId",
                        column: x => x.TeamId,
                        principalTable: "teams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "player_teams",
                columns: table => new
                {
                    PlayerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TeamId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SquadNumber = table.Column<int>(type: "int", nullable: true),
                    AssignedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_player_teams", x => new { x.PlayerId, x.TeamId });
                    table.ForeignKey(
                        name: "FK_player_teams_players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_player_teams_teams_TeamId",
                        column: x => x.TeamId,
                        principalTable: "teams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "team_coaches",
                columns: table => new
                {
                    TeamId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CoachId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AssignedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_team_coaches", x => new { x.TeamId, x.CoachId });
                    table.ForeignKey(
                        name: "FK_team_coaches_coaches_CoachId",
                        column: x => x.CoachId,
                        principalTable: "coaches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_team_coaches_teams_TeamId",
                        column: x => x.TeamId,
                        principalTable: "teams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TrainingSessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TeamId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SessionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    MeetTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DurationMinutes = table.Column<int>(type: "int", nullable: true),
                    Location = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FocusAreas = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TemplateId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    IsLocked = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrainingSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TrainingSessions_DrillTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "DrillTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TrainingSessions_teams_TeamId",
                        column: x => x.TeamId,
                        principalTable: "teams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "development_goals",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlanId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Goal = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Actions = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: true),
                    TargetDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Completed = table.Column<bool>(type: "bit", nullable: false),
                    CompletedDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Progress = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_development_goals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_development_goals_development_plans_PlanId",
                        column: x => x.PlanId,
                        principalTable: "development_plans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PersonalSessionDrills",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PersonalSessionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DrillId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PersonalSessionDrills", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PersonalSessionDrills_PersonalSessions_PersonalSessionId",
                        column: x => x.PersonalSessionId,
                        principalTable: "PersonalSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PersonalSessionDrills_drills_DrillId",
                        column: x => x.DrillId,
                        principalTable: "drills",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "KitOrderItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OrderId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Size = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KitOrderItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_KitOrderItems_KitOrders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "KitOrders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "matches",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TeamId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SeasonId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SquadSize = table.Column<int>(type: "int", nullable: false),
                    Opposition = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MatchDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    MeetTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    KickOffTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Location = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsHome = table.Column<bool>(type: "bit", nullable: false),
                    Competition = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PrimaryKitId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SecondaryKitId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    GoalkeeperKitId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    HomeScore = table.Column<int>(type: "int", nullable: true),
                    AwayScore = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    IsLocked = table.Column<bool>(type: "bit", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    WeatherCondition = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    WeatherTemperature = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_matches", x => x.Id);
                    table.ForeignKey(
                        name: "FK_matches_kits_GoalkeeperKitId",
                        column: x => x.GoalkeeperKitId,
                        principalTable: "kits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_matches_kits_PrimaryKitId",
                        column: x => x.PrimaryKitId,
                        principalTable: "kits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_matches_kits_SecondaryKitId",
                        column: x => x.SecondaryKitId,
                        principalTable: "kits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_matches_teams_TeamId",
                        column: x => x.TeamId,
                        principalTable: "teams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AppliedTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SessionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TemplateId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AppliedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppliedTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppliedTemplates_DrillTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "DrillTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AppliedTemplates_TrainingSessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "TrainingSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "session_attendance",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SessionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlayerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Present = table.Column<bool>(type: "bit", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PlayerId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_session_attendance", x => x.Id);
                    table.ForeignKey(
                        name: "FK_session_attendance_TrainingSessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "TrainingSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_session_attendance_players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_session_attendance_players_PlayerId1",
                        column: x => x.PlayerId1,
                        principalTable: "players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "session_drills",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SessionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DrillId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Source = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TemplateId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DrillOrder = table.Column<int>(type: "int", nullable: false),
                    DrillId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_session_drills", x => x.Id);
                    table.ForeignKey(
                        name: "FK_session_drills_DrillTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "DrillTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_session_drills_TrainingSessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "TrainingSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_session_drills_drills_DrillId",
                        column: x => x.DrillId,
                        principalTable: "drills",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_session_drills_drills_DrillId1",
                        column: x => x.DrillId1,
                        principalTable: "drills",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SessionCoaches",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SessionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CoachId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SessionCoaches", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SessionCoaches_TrainingSessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "TrainingSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SessionCoaches_coaches_CoachId",
                        column: x => x.CoachId,
                        principalTable: "coaches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "match_lineups",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MatchId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FormationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TacticId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FormationId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FormationId2 = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_match_lineups", x => x.Id);
                    table.ForeignKey(
                        name: "FK_match_lineups_formations_FormationId",
                        column: x => x.FormationId,
                        principalTable: "formations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_match_lineups_formations_FormationId1",
                        column: x => x.FormationId1,
                        principalTable: "formations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_match_lineups_formations_FormationId2",
                        column: x => x.FormationId2,
                        principalTable: "formations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_match_lineups_formations_TacticId",
                        column: x => x.TacticId,
                        principalTable: "formations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_match_lineups_matches_MatchId",
                        column: x => x.MatchId,
                        principalTable: "matches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "match_reports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MatchId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Summary = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CaptainId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    PlayerOfMatchId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PlayerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    PlayerId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_match_reports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_match_reports_matches_MatchId",
                        column: x => x.MatchId,
                        principalTable: "matches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_match_reports_players_CaptainId",
                        column: x => x.CaptainId,
                        principalTable: "players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_match_reports_players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_match_reports_players_PlayerId1",
                        column: x => x.PlayerId1,
                        principalTable: "players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_match_reports_players_PlayerOfMatchId",
                        column: x => x.PlayerOfMatchId,
                        principalTable: "players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "match_substitutions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MatchId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Minute = table.Column<int>(type: "int", nullable: false),
                    PlayerOutId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlayerInId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlayerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    PlayerId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_match_substitutions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_match_substitutions_matches_MatchId",
                        column: x => x.MatchId,
                        principalTable: "matches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_match_substitutions_players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_match_substitutions_players_PlayerId1",
                        column: x => x.PlayerId1,
                        principalTable: "players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_match_substitutions_players_PlayerInId",
                        column: x => x.PlayerInId,
                        principalTable: "players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_match_substitutions_players_PlayerOutId",
                        column: x => x.PlayerOutId,
                        principalTable: "players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MatchCoaches",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MatchId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CoachId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MatchCoaches", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MatchCoaches_coaches_CoachId",
                        column: x => x.CoachId,
                        principalTable: "coaches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MatchCoaches_matches_MatchId",
                        column: x => x.MatchId,
                        principalTable: "matches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "lineup_players",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LineupId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlayerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Position = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SquadNumber = table.Column<int>(type: "int", nullable: true),
                    IsStarting = table.Column<bool>(type: "bit", nullable: false),
                    PlayerId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_lineup_players", x => x.Id);
                    table.ForeignKey(
                        name: "FK_lineup_players_match_lineups_LineupId",
                        column: x => x.LineupId,
                        principalTable: "match_lineups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_lineup_players_players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_lineup_players_players_PlayerId1",
                        column: x => x.PlayerId1,
                        principalTable: "players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "cards",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MatchReportId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlayerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Minute = table.Column<int>(type: "int", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PlayerId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_cards", x => x.Id);
                    table.ForeignKey(
                        name: "FK_cards_match_reports_MatchReportId",
                        column: x => x.MatchReportId,
                        principalTable: "match_reports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_cards_players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_cards_players_PlayerId1",
                        column: x => x.PlayerId1,
                        principalTable: "players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "goals",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MatchReportId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlayerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Minute = table.Column<int>(type: "int", nullable: false),
                    AssistPlayerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    PlayerId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    PlayerId2 = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_goals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_goals_match_reports_MatchReportId",
                        column: x => x.MatchReportId,
                        principalTable: "match_reports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_goals_players_AssistPlayerId",
                        column: x => x.AssistPlayerId,
                        principalTable: "players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_goals_players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_goals_players_PlayerId1",
                        column: x => x.PlayerId1,
                        principalTable: "players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_goals_players_PlayerId2",
                        column: x => x.PlayerId2,
                        principalTable: "players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Injuries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MatchReportId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlayerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Minute = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Severity = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Injuries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Injuries_match_reports_MatchReportId",
                        column: x => x.MatchReportId,
                        principalTable: "match_reports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Injuries_players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "performance_ratings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MatchReportId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlayerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Rating = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    PlayerId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_performance_ratings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_performance_ratings_match_reports_MatchReportId",
                        column: x => x.MatchReportId,
                        principalTable: "match_reports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_performance_ratings_players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_performance_ratings_players_PlayerId1",
                        column: x => x.PlayerId1,
                        principalTable: "players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_age_groups_ClubId",
                table: "age_groups",
                column: "ClubId");

            migrationBuilder.CreateIndex(
                name: "IX_AgeGroupCoordinators_AgeGroupId",
                table: "AgeGroupCoordinators",
                column: "AgeGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_AgeGroupCoordinators_CoachId",
                table: "AgeGroupCoordinators",
                column: "CoachId");

            migrationBuilder.CreateIndex(
                name: "IX_AppliedTemplates_SessionId",
                table: "AppliedTemplates",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_AppliedTemplates_TemplateId",
                table: "AppliedTemplates",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_AttributeEvaluations_EvaluatedByNavigationId",
                table: "AttributeEvaluations",
                column: "EvaluatedByNavigationId");

            migrationBuilder.CreateIndex(
                name: "IX_AttributeEvaluations_PlayerId",
                table: "AttributeEvaluations",
                column: "PlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_cards_MatchReportId",
                table: "cards",
                column: "MatchReportId");

            migrationBuilder.CreateIndex(
                name: "IX_cards_PlayerId",
                table: "cards",
                column: "PlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_cards_PlayerId1",
                table: "cards",
                column: "PlayerId1");

            migrationBuilder.CreateIndex(
                name: "IX_coaches_ClubId",
                table: "coaches",
                column: "ClubId");

            migrationBuilder.CreateIndex(
                name: "IX_development_goals_PlanId",
                table: "development_goals",
                column: "PlanId");

            migrationBuilder.CreateIndex(
                name: "IX_development_plans_CreatedByNavigationId",
                table: "development_plans",
                column: "CreatedByNavigationId");

            migrationBuilder.CreateIndex(
                name: "IX_development_plans_LinkedReportId",
                table: "development_plans",
                column: "LinkedReportId");

            migrationBuilder.CreateIndex(
                name: "IX_development_plans_PlayerId",
                table: "development_plans",
                column: "PlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_DrillLinks_DrillId",
                table: "DrillLinks",
                column: "DrillId");

            migrationBuilder.CreateIndex(
                name: "IX_drills_ClubId",
                table: "drills",
                column: "ClubId");

            migrationBuilder.CreateIndex(
                name: "IX_drills_CreatedByNavigationId",
                table: "drills",
                column: "CreatedByNavigationId");

            migrationBuilder.CreateIndex(
                name: "IX_DrillTemplates_ClubId",
                table: "DrillTemplates",
                column: "ClubId");

            migrationBuilder.CreateIndex(
                name: "IX_DrillTemplates_CreatedByNavigationId",
                table: "DrillTemplates",
                column: "CreatedByNavigationId");

            migrationBuilder.CreateIndex(
                name: "IX_EmergencyContacts_PlayerId",
                table: "EmergencyContacts",
                column: "PlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_EvaluationAttributes_EvaluationId",
                table: "EvaluationAttributes",
                column: "EvaluationId");

            migrationBuilder.CreateIndex(
                name: "IX_formation_positions_FormationId",
                table: "formation_positions",
                column: "FormationId");

            migrationBuilder.CreateIndex(
                name: "IX_formations_CreatedByNavigationId",
                table: "formations",
                column: "CreatedByNavigationId");

            migrationBuilder.CreateIndex(
                name: "IX_formations_ParentFormationId",
                table: "formations",
                column: "ParentFormationId");

            migrationBuilder.CreateIndex(
                name: "IX_formations_ParentTacticId",
                table: "formations",
                column: "ParentTacticId");

            migrationBuilder.CreateIndex(
                name: "IX_formations_ScopeClubId",
                table: "formations",
                column: "ScopeClubId");

            migrationBuilder.CreateIndex(
                name: "IX_goals_AssistPlayerId",
                table: "goals",
                column: "AssistPlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_goals_MatchReportId",
                table: "goals",
                column: "MatchReportId");

            migrationBuilder.CreateIndex(
                name: "IX_goals_PlayerId",
                table: "goals",
                column: "PlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_goals_PlayerId1",
                table: "goals",
                column: "PlayerId1");

            migrationBuilder.CreateIndex(
                name: "IX_goals_PlayerId2",
                table: "goals",
                column: "PlayerId2");

            migrationBuilder.CreateIndex(
                name: "IX_Injuries_MatchReportId",
                table: "Injuries",
                column: "MatchReportId");

            migrationBuilder.CreateIndex(
                name: "IX_Injuries_PlayerId",
                table: "Injuries",
                column: "PlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_KitOrderItems_OrderId",
                table: "KitOrderItems",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_KitOrders_OrderedByNavigationId",
                table: "KitOrders",
                column: "OrderedByNavigationId");

            migrationBuilder.CreateIndex(
                name: "IX_KitOrders_PlayerId",
                table: "KitOrders",
                column: "PlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_KitOrders_TeamId",
                table: "KitOrders",
                column: "TeamId");

            migrationBuilder.CreateIndex(
                name: "IX_kits_ClubId",
                table: "kits",
                column: "ClubId");

            migrationBuilder.CreateIndex(
                name: "IX_kits_TeamId",
                table: "kits",
                column: "TeamId");

            migrationBuilder.CreateIndex(
                name: "IX_lineup_players_LineupId",
                table: "lineup_players",
                column: "LineupId");

            migrationBuilder.CreateIndex(
                name: "IX_lineup_players_PlayerId",
                table: "lineup_players",
                column: "PlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_lineup_players_PlayerId1",
                table: "lineup_players",
                column: "PlayerId1");

            migrationBuilder.CreateIndex(
                name: "IX_match_lineups_FormationId",
                table: "match_lineups",
                column: "FormationId");

            migrationBuilder.CreateIndex(
                name: "IX_match_lineups_FormationId1",
                table: "match_lineups",
                column: "FormationId1");

            migrationBuilder.CreateIndex(
                name: "IX_match_lineups_FormationId2",
                table: "match_lineups",
                column: "FormationId2");

            migrationBuilder.CreateIndex(
                name: "IX_match_lineups_MatchId",
                table: "match_lineups",
                column: "MatchId");

            migrationBuilder.CreateIndex(
                name: "IX_match_lineups_TacticId",
                table: "match_lineups",
                column: "TacticId");

            migrationBuilder.CreateIndex(
                name: "IX_match_reports_CaptainId",
                table: "match_reports",
                column: "CaptainId");

            migrationBuilder.CreateIndex(
                name: "IX_match_reports_MatchId",
                table: "match_reports",
                column: "MatchId");

            migrationBuilder.CreateIndex(
                name: "IX_match_reports_PlayerId",
                table: "match_reports",
                column: "PlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_match_reports_PlayerId1",
                table: "match_reports",
                column: "PlayerId1");

            migrationBuilder.CreateIndex(
                name: "IX_match_reports_PlayerOfMatchId",
                table: "match_reports",
                column: "PlayerOfMatchId");

            migrationBuilder.CreateIndex(
                name: "IX_match_substitutions_MatchId",
                table: "match_substitutions",
                column: "MatchId");

            migrationBuilder.CreateIndex(
                name: "IX_match_substitutions_PlayerId",
                table: "match_substitutions",
                column: "PlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_match_substitutions_PlayerId1",
                table: "match_substitutions",
                column: "PlayerId1");

            migrationBuilder.CreateIndex(
                name: "IX_match_substitutions_PlayerInId",
                table: "match_substitutions",
                column: "PlayerInId");

            migrationBuilder.CreateIndex(
                name: "IX_match_substitutions_PlayerOutId",
                table: "match_substitutions",
                column: "PlayerOutId");

            migrationBuilder.CreateIndex(
                name: "IX_MatchCoaches_CoachId",
                table: "MatchCoaches",
                column: "CoachId");

            migrationBuilder.CreateIndex(
                name: "IX_MatchCoaches_MatchId",
                table: "MatchCoaches",
                column: "MatchId");

            migrationBuilder.CreateIndex(
                name: "IX_matches_GoalkeeperKitId",
                table: "matches",
                column: "GoalkeeperKitId");

            migrationBuilder.CreateIndex(
                name: "IX_matches_PrimaryKitId",
                table: "matches",
                column: "PrimaryKitId");

            migrationBuilder.CreateIndex(
                name: "IX_matches_SecondaryKitId",
                table: "matches",
                column: "SecondaryKitId");

            migrationBuilder.CreateIndex(
                name: "IX_matches_TeamId",
                table: "matches",
                column: "TeamId");

            migrationBuilder.CreateIndex(
                name: "IX_performance_ratings_MatchReportId",
                table: "performance_ratings",
                column: "MatchReportId");

            migrationBuilder.CreateIndex(
                name: "IX_performance_ratings_PlayerId",
                table: "performance_ratings",
                column: "PlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_performance_ratings_PlayerId1",
                table: "performance_ratings",
                column: "PlayerId1");

            migrationBuilder.CreateIndex(
                name: "IX_PersonalSessionDrills_DrillId",
                table: "PersonalSessionDrills",
                column: "DrillId");

            migrationBuilder.CreateIndex(
                name: "IX_PersonalSessionDrills_PersonalSessionId",
                table: "PersonalSessionDrills",
                column: "PersonalSessionId");

            migrationBuilder.CreateIndex(
                name: "IX_PersonalSessions_PlanId",
                table: "PersonalSessions",
                column: "PlanId");

            migrationBuilder.CreateIndex(
                name: "IX_player_age_groups_AgeGroupId",
                table: "player_age_groups",
                column: "AgeGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_player_attributes_PlayerId",
                table: "player_attributes",
                column: "PlayerId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_player_reports_CreatedByNavigationId",
                table: "player_reports",
                column: "CreatedByNavigationId");

            migrationBuilder.CreateIndex(
                name: "IX_player_reports_PlayerId",
                table: "player_reports",
                column: "PlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_player_teams_TeamId",
                table: "player_teams",
                column: "TeamId");

            migrationBuilder.CreateIndex(
                name: "IX_PlayerImages_PlayerId",
                table: "PlayerImages",
                column: "PlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_PlayerImages_UploadedByNavigationId",
                table: "PlayerImages",
                column: "UploadedByNavigationId");

            migrationBuilder.CreateIndex(
                name: "IX_PlayerParents_ParentUserId",
                table: "PlayerParents",
                column: "ParentUserId");

            migrationBuilder.CreateIndex(
                name: "IX_PlayerParents_PlayerId",
                table: "PlayerParents",
                column: "PlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_players_ClubId",
                table: "players",
                column: "ClubId");

            migrationBuilder.CreateIndex(
                name: "IX_PositionOverrides_FormationId",
                table: "PositionOverrides",
                column: "FormationId");

            migrationBuilder.CreateIndex(
                name: "IX_ProgressNotes_AddedByNavigationId",
                table: "ProgressNotes",
                column: "AddedByNavigationId");

            migrationBuilder.CreateIndex(
                name: "IX_ProgressNotes_PlanId",
                table: "ProgressNotes",
                column: "PlanId");

            migrationBuilder.CreateIndex(
                name: "IX_ReportDevelopmentActions_ReportId",
                table: "ReportDevelopmentActions",
                column: "ReportId");

            migrationBuilder.CreateIndex(
                name: "IX_session_attendance_PlayerId",
                table: "session_attendance",
                column: "PlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_session_attendance_PlayerId1",
                table: "session_attendance",
                column: "PlayerId1");

            migrationBuilder.CreateIndex(
                name: "IX_session_attendance_SessionId",
                table: "session_attendance",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_session_drills_DrillId",
                table: "session_drills",
                column: "DrillId");

            migrationBuilder.CreateIndex(
                name: "IX_session_drills_DrillId1",
                table: "session_drills",
                column: "DrillId1");

            migrationBuilder.CreateIndex(
                name: "IX_session_drills_SessionId",
                table: "session_drills",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_session_drills_TemplateId",
                table: "session_drills",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_SessionCoaches_CoachId",
                table: "SessionCoaches",
                column: "CoachId");

            migrationBuilder.CreateIndex(
                name: "IX_SessionCoaches_SessionId",
                table: "SessionCoaches",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_SimilarProfessionals_ReportId",
                table: "SimilarProfessionals",
                column: "ReportId");

            migrationBuilder.CreateIndex(
                name: "IX_tactic_principles_FormationId",
                table: "tactic_principles",
                column: "FormationId");

            migrationBuilder.CreateIndex(
                name: "IX_tactic_principles_FormationId1",
                table: "tactic_principles",
                column: "FormationId1");

            migrationBuilder.CreateIndex(
                name: "IX_team_coaches_CoachId",
                table: "team_coaches",
                column: "CoachId");

            migrationBuilder.CreateIndex(
                name: "IX_teams_AgeGroupId",
                table: "teams",
                column: "AgeGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_teams_ClubId",
                table: "teams",
                column: "ClubId");

            migrationBuilder.CreateIndex(
                name: "IX_teams_FormationId",
                table: "teams",
                column: "FormationId");

            migrationBuilder.CreateIndex(
                name: "IX_template_drills_DrillId",
                table: "template_drills",
                column: "DrillId");

            migrationBuilder.CreateIndex(
                name: "IX_template_drills_DrillId1",
                table: "template_drills",
                column: "DrillId1");

            migrationBuilder.CreateIndex(
                name: "IX_template_drills_TemplateId",
                table: "template_drills",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_TrainingObjectives_PlanId",
                table: "TrainingObjectives",
                column: "PlanId");

            migrationBuilder.CreateIndex(
                name: "IX_TrainingPlans_CreatedByNavigationId",
                table: "TrainingPlans",
                column: "CreatedByNavigationId");

            migrationBuilder.CreateIndex(
                name: "IX_TrainingPlans_PlayerId",
                table: "TrainingPlans",
                column: "PlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_TrainingSessions_TeamId",
                table: "TrainingSessions",
                column: "TeamId");

            migrationBuilder.CreateIndex(
                name: "IX_TrainingSessions_TemplateId",
                table: "TrainingSessions",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_users_club_id",
                table: "users",
                column: "club_id");

            migrationBuilder.CreateIndex(
                name: "IX_users_email",
                table: "users",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_users_player_id",
                table: "users",
                column: "player_id");

            migrationBuilder.CreateIndex(
                name: "IX_users_staff_id",
                table: "users",
                column: "staff_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AgeGroupCoordinators");

            migrationBuilder.DropTable(
                name: "AppliedTemplates");

            migrationBuilder.DropTable(
                name: "cards");

            migrationBuilder.DropTable(
                name: "development_goals");

            migrationBuilder.DropTable(
                name: "DrillLinks");

            migrationBuilder.DropTable(
                name: "EmergencyContacts");

            migrationBuilder.DropTable(
                name: "EvaluationAttributes");

            migrationBuilder.DropTable(
                name: "formation_positions");

            migrationBuilder.DropTable(
                name: "goals");

            migrationBuilder.DropTable(
                name: "Injuries");

            migrationBuilder.DropTable(
                name: "KitOrderItems");

            migrationBuilder.DropTable(
                name: "lineup_players");

            migrationBuilder.DropTable(
                name: "match_substitutions");

            migrationBuilder.DropTable(
                name: "MatchCoaches");

            migrationBuilder.DropTable(
                name: "performance_ratings");

            migrationBuilder.DropTable(
                name: "PersonalSessionDrills");

            migrationBuilder.DropTable(
                name: "player_age_groups");

            migrationBuilder.DropTable(
                name: "player_attributes");

            migrationBuilder.DropTable(
                name: "player_teams");

            migrationBuilder.DropTable(
                name: "PlayerImages");

            migrationBuilder.DropTable(
                name: "PlayerParents");

            migrationBuilder.DropTable(
                name: "PositionOverrides");

            migrationBuilder.DropTable(
                name: "ProgressNotes");

            migrationBuilder.DropTable(
                name: "ReportDevelopmentActions");

            migrationBuilder.DropTable(
                name: "session_attendance");

            migrationBuilder.DropTable(
                name: "session_drills");

            migrationBuilder.DropTable(
                name: "SessionCoaches");

            migrationBuilder.DropTable(
                name: "SimilarProfessionals");

            migrationBuilder.DropTable(
                name: "tactic_principles");

            migrationBuilder.DropTable(
                name: "team_coaches");

            migrationBuilder.DropTable(
                name: "template_drills");

            migrationBuilder.DropTable(
                name: "TrainingObjectives");

            migrationBuilder.DropTable(
                name: "development_plans");

            migrationBuilder.DropTable(
                name: "AttributeEvaluations");

            migrationBuilder.DropTable(
                name: "KitOrders");

            migrationBuilder.DropTable(
                name: "match_lineups");

            migrationBuilder.DropTable(
                name: "match_reports");

            migrationBuilder.DropTable(
                name: "PersonalSessions");

            migrationBuilder.DropTable(
                name: "TrainingSessions");

            migrationBuilder.DropTable(
                name: "drills");

            migrationBuilder.DropTable(
                name: "player_reports");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropTable(
                name: "matches");

            migrationBuilder.DropTable(
                name: "TrainingPlans");

            migrationBuilder.DropTable(
                name: "DrillTemplates");

            migrationBuilder.DropTable(
                name: "kits");

            migrationBuilder.DropTable(
                name: "players");

            migrationBuilder.DropTable(
                name: "teams");

            migrationBuilder.DropTable(
                name: "age_groups");

            migrationBuilder.DropTable(
                name: "formations");

            migrationBuilder.DropTable(
                name: "coaches");

            migrationBuilder.DropTable(
                name: "clubs");
        }
    }
}
