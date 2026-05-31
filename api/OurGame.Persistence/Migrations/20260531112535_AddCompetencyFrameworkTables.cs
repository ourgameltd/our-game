using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OurGame.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCompetencyFrameworkTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Format",
                table: "Teams",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "OverallBand",
                table: "Players",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AgeGroupCompetencySettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AgeGroupId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AllowTeamOverride = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AgeGroupCompetencySettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AgeGroupCompetencySettings_AgeGroups_AgeGroupId",
                        column: x => x.AgeGroupId,
                        principalTable: "AgeGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ClubCompetencySettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClubId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AllowAgeGroupOverride = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClubCompetencySettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClubCompetencySettings_Clubs_ClubId",
                        column: x => x.ClubId,
                        principalTable: "Clubs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Competencies",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Competencies", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CompetencyCategories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompetencyCategories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CompetencyFrameworks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1024)", maxLength: 1024, nullable: true),
                    IsSystemDefault = table.Column<bool>(type: "bit", nullable: false),
                    SourceFrameworkId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Scope = table.Column<int>(type: "int", nullable: false),
                    OwnerClubId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    OwnerAgeGroupId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    OwnerTeamId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpliftPercent = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    IsArchived = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompetencyFrameworks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompetencyFrameworks_AgeGroups_OwnerAgeGroupId",
                        column: x => x.OwnerAgeGroupId,
                        principalTable: "AgeGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CompetencyFrameworks_Clubs_OwnerClubId",
                        column: x => x.OwnerClubId,
                        principalTable: "Clubs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CompetencyFrameworks_CompetencyFrameworks_SourceFrameworkId",
                        column: x => x.SourceFrameworkId,
                        principalTable: "CompetencyFrameworks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CompetencyFrameworks_Teams_OwnerTeamId",
                        column: x => x.OwnerTeamId,
                        principalTable: "Teams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PlayerCompetencyEvaluations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlayerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EvaluatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EvaluatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CoachNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PeriodStart = table.Column<DateOnly>(type: "date", nullable: true),
                    PeriodEnd = table.Column<DateOnly>(type: "date", nullable: true),
                    IsArchived = table.Column<bool>(type: "bit", nullable: false),
                    PlayerId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlayerCompetencyEvaluations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlayerCompetencyEvaluations_Coaches_EvaluatedBy",
                        column: x => x.EvaluatedBy,
                        principalTable: "Coaches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PlayerCompetencyEvaluations_Players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "Players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PlayerCompetencyEvaluations_Players_PlayerId1",
                        column: x => x.PlayerId1,
                        principalTable: "Players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PlayerCompetencyLevels",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlayerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CompetencyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Band = table.Column<int>(type: "int", nullable: false),
                    UpdatedByCoachId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PlayerId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlayerCompetencyLevels", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlayerCompetencyLevels_Coaches_UpdatedByCoachId",
                        column: x => x.UpdatedByCoachId,
                        principalTable: "Coaches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PlayerCompetencyLevels_Competencies_CompetencyId",
                        column: x => x.CompetencyId,
                        principalTable: "Competencies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PlayerCompetencyLevels_Players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "Players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PlayerCompetencyLevels_Players_PlayerId1",
                        column: x => x.PlayerId1,
                        principalTable: "Players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CompetencyAttributes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CompetencyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompetencyAttributes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompetencyAttributes_Competencies_CompetencyId",
                        column: x => x.CompetencyId,
                        principalTable: "Competencies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CompetencyAttributes_CompetencyCategories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "CompetencyCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CompetencyFrameworkAssignments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FrameworkId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Scope = table.Column<int>(type: "int", nullable: false),
                    ClubId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    AgeGroupId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TeamId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompetencyFrameworkAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompetencyFrameworkAssignments_AgeGroups_AgeGroupId",
                        column: x => x.AgeGroupId,
                        principalTable: "AgeGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CompetencyFrameworkAssignments_Clubs_ClubId",
                        column: x => x.ClubId,
                        principalTable: "Clubs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CompetencyFrameworkAssignments_CompetencyFrameworks_FrameworkId",
                        column: x => x.FrameworkId,
                        principalTable: "CompetencyFrameworks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CompetencyFrameworkAssignments_Teams_TeamId",
                        column: x => x.TeamId,
                        principalTable: "Teams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CompetencyFrameworkBandThresholds",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FrameworkId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Band = table.Column<int>(type: "int", nullable: false),
                    Threshold = table.Column<decimal>(type: "decimal(6,2)", precision: 6, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompetencyFrameworkBandThresholds", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompetencyFrameworkBandThresholds_CompetencyFrameworks_FrameworkId",
                        column: x => x.FrameworkId,
                        principalTable: "CompetencyFrameworks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CompetencyFrameworkCompetencyDescriptions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FrameworkId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CompetencyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Band = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1024)", maxLength: 1024, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompetencyFrameworkCompetencyDescriptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompetencyFrameworkCompetencyDescriptions_Competencies_CompetencyId",
                        column: x => x.CompetencyId,
                        principalTable: "Competencies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CompetencyFrameworkCompetencyDescriptions_CompetencyFrameworks_FrameworkId",
                        column: x => x.FrameworkId,
                        principalTable: "CompetencyFrameworks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PlayerTeamScores",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlayerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TeamId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FrameworkId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Format = table.Column<int>(type: "int", nullable: false),
                    BaseScore = table.Column<decimal>(type: "decimal(6,2)", precision: 6, scale: 2, nullable: false),
                    BoostedScore = table.Column<decimal>(type: "decimal(6,2)", precision: 6, scale: 2, nullable: false),
                    Band = table.Column<int>(type: "int", nullable: false),
                    DerivedAttributesJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CalculatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PlayerId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlayerTeamScores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlayerTeamScores_CompetencyFrameworks_FrameworkId",
                        column: x => x.FrameworkId,
                        principalTable: "CompetencyFrameworks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PlayerTeamScores_Players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "Players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PlayerTeamScores_Players_PlayerId1",
                        column: x => x.PlayerId1,
                        principalTable: "Players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PlayerTeamScores_Teams_TeamId",
                        column: x => x.TeamId,
                        principalTable: "Teams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PlayerCompetencyEvaluationLevels",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EvaluationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CompetencyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Band = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlayerCompetencyEvaluationLevels", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlayerCompetencyEvaluationLevels_Competencies_CompetencyId",
                        column: x => x.CompetencyId,
                        principalTable: "Competencies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PlayerCompetencyEvaluationLevels_PlayerCompetencyEvaluations_EvaluationId",
                        column: x => x.EvaluationId,
                        principalTable: "PlayerCompetencyEvaluations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CompetencyFrameworkAttributeWeights",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FrameworkId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AttributeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Format = table.Column<int>(type: "int", nullable: false),
                    WeightPercent = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompetencyFrameworkAttributeWeights", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompetencyFrameworkAttributeWeights_CompetencyAttributes_AttributeId",
                        column: x => x.AttributeId,
                        principalTable: "CompetencyAttributes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CompetencyFrameworkAttributeWeights_CompetencyFrameworks_FrameworkId",
                        column: x => x.FrameworkId,
                        principalTable: "CompetencyFrameworks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AgeGroupCompetencySettings_AgeGroupId",
                table: "AgeGroupCompetencySettings",
                column: "AgeGroupId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ClubCompetencySettings_ClubId",
                table: "ClubCompetencySettings",
                column: "ClubId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Competencies_Name",
                table: "Competencies",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CompetencyAttributes_CategoryId",
                table: "CompetencyAttributes",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_CompetencyAttributes_CompetencyId",
                table: "CompetencyAttributes",
                column: "CompetencyId");

            migrationBuilder.CreateIndex(
                name: "IX_CompetencyAttributes_Name",
                table: "CompetencyAttributes",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CompetencyCategories_Name",
                table: "CompetencyCategories",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CompetencyFrameworkAssignments_AgeGroupId",
                table: "CompetencyFrameworkAssignments",
                column: "AgeGroupId",
                unique: true,
                filter: "[AgeGroupId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_CompetencyFrameworkAssignments_ClubId",
                table: "CompetencyFrameworkAssignments",
                column: "ClubId",
                unique: true,
                filter: "[ClubId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_CompetencyFrameworkAssignments_FrameworkId",
                table: "CompetencyFrameworkAssignments",
                column: "FrameworkId");

            migrationBuilder.CreateIndex(
                name: "IX_CompetencyFrameworkAssignments_TeamId",
                table: "CompetencyFrameworkAssignments",
                column: "TeamId",
                unique: true,
                filter: "[TeamId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_CompetencyFrameworkAttributeWeights_AttributeId",
                table: "CompetencyFrameworkAttributeWeights",
                column: "AttributeId");

            migrationBuilder.CreateIndex(
                name: "IX_CompetencyFrameworkAttributeWeights_FrameworkId_AttributeId_Format",
                table: "CompetencyFrameworkAttributeWeights",
                columns: new[] { "FrameworkId", "AttributeId", "Format" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CompetencyFrameworkBandThresholds_FrameworkId_Band",
                table: "CompetencyFrameworkBandThresholds",
                columns: new[] { "FrameworkId", "Band" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CompetencyFrameworkCompetencyDescriptions_CompetencyId",
                table: "CompetencyFrameworkCompetencyDescriptions",
                column: "CompetencyId");

            migrationBuilder.CreateIndex(
                name: "IX_CompetencyFrameworkCompetencyDescriptions_FrameworkId_CompetencyId_Band",
                table: "CompetencyFrameworkCompetencyDescriptions",
                columns: new[] { "FrameworkId", "CompetencyId", "Band" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CompetencyFrameworks_OwnerAgeGroupId",
                table: "CompetencyFrameworks",
                column: "OwnerAgeGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_CompetencyFrameworks_OwnerClubId",
                table: "CompetencyFrameworks",
                column: "OwnerClubId");

            migrationBuilder.CreateIndex(
                name: "IX_CompetencyFrameworks_OwnerTeamId",
                table: "CompetencyFrameworks",
                column: "OwnerTeamId");

            migrationBuilder.CreateIndex(
                name: "IX_CompetencyFrameworks_Scope_OwnerClubId_OwnerAgeGroupId_OwnerTeamId",
                table: "CompetencyFrameworks",
                columns: new[] { "Scope", "OwnerClubId", "OwnerAgeGroupId", "OwnerTeamId" });

            migrationBuilder.CreateIndex(
                name: "IX_CompetencyFrameworks_SourceFrameworkId",
                table: "CompetencyFrameworks",
                column: "SourceFrameworkId");

            migrationBuilder.CreateIndex(
                name: "IX_PlayerCompetencyEvaluationLevels_CompetencyId",
                table: "PlayerCompetencyEvaluationLevels",
                column: "CompetencyId");

            migrationBuilder.CreateIndex(
                name: "IX_PlayerCompetencyEvaluationLevels_EvaluationId_CompetencyId",
                table: "PlayerCompetencyEvaluationLevels",
                columns: new[] { "EvaluationId", "CompetencyId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PlayerCompetencyEvaluations_EvaluatedBy",
                table: "PlayerCompetencyEvaluations",
                column: "EvaluatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_PlayerCompetencyEvaluations_PlayerId_EvaluatedAt",
                table: "PlayerCompetencyEvaluations",
                columns: new[] { "PlayerId", "EvaluatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_PlayerCompetencyEvaluations_PlayerId1",
                table: "PlayerCompetencyEvaluations",
                column: "PlayerId1");

            migrationBuilder.CreateIndex(
                name: "IX_PlayerCompetencyLevels_CompetencyId",
                table: "PlayerCompetencyLevels",
                column: "CompetencyId");

            migrationBuilder.CreateIndex(
                name: "IX_PlayerCompetencyLevels_PlayerId_CompetencyId",
                table: "PlayerCompetencyLevels",
                columns: new[] { "PlayerId", "CompetencyId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PlayerCompetencyLevels_PlayerId1",
                table: "PlayerCompetencyLevels",
                column: "PlayerId1");

            migrationBuilder.CreateIndex(
                name: "IX_PlayerCompetencyLevels_UpdatedByCoachId",
                table: "PlayerCompetencyLevels",
                column: "UpdatedByCoachId");

            migrationBuilder.CreateIndex(
                name: "IX_PlayerTeamScores_FrameworkId",
                table: "PlayerTeamScores",
                column: "FrameworkId");

            migrationBuilder.CreateIndex(
                name: "IX_PlayerTeamScores_PlayerId_TeamId",
                table: "PlayerTeamScores",
                columns: new[] { "PlayerId", "TeamId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PlayerTeamScores_PlayerId1",
                table: "PlayerTeamScores",
                column: "PlayerId1");

            migrationBuilder.CreateIndex(
                name: "IX_PlayerTeamScores_TeamId",
                table: "PlayerTeamScores",
                column: "TeamId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AgeGroupCompetencySettings");

            migrationBuilder.DropTable(
                name: "ClubCompetencySettings");

            migrationBuilder.DropTable(
                name: "CompetencyFrameworkAssignments");

            migrationBuilder.DropTable(
                name: "CompetencyFrameworkAttributeWeights");

            migrationBuilder.DropTable(
                name: "CompetencyFrameworkBandThresholds");

            migrationBuilder.DropTable(
                name: "CompetencyFrameworkCompetencyDescriptions");

            migrationBuilder.DropTable(
                name: "PlayerCompetencyEvaluationLevels");

            migrationBuilder.DropTable(
                name: "PlayerCompetencyLevels");

            migrationBuilder.DropTable(
                name: "PlayerTeamScores");

            migrationBuilder.DropTable(
                name: "CompetencyAttributes");

            migrationBuilder.DropTable(
                name: "PlayerCompetencyEvaluations");

            migrationBuilder.DropTable(
                name: "CompetencyFrameworks");

            migrationBuilder.DropTable(
                name: "Competencies");

            migrationBuilder.DropTable(
                name: "CompetencyCategories");

            migrationBuilder.DropColumn(
                name: "Format",
                table: "Teams");

            migrationBuilder.DropColumn(
                name: "OverallBand",
                table: "Players");
        }
    }
}
