using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OurGame.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddGoalkeeperCompetencySupport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CompetencyFrameworkCompetencyDescriptions_FrameworkId_CompetencyId_Band",
                table: "CompetencyFrameworkCompetencyDescriptions");

            migrationBuilder.DropIndex(
                name: "IX_CompetencyFrameworkAttributeWeights_FrameworkId_AttributeId_Format",
                table: "CompetencyFrameworkAttributeWeights");

            migrationBuilder.AddColumn<bool>(
                name: "IsGoalkeeper",
                table: "CompetencyFrameworkCompetencyDescriptions",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsGoalkeeper",
                table: "CompetencyFrameworkAttributeWeights",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "GoalkeeperName",
                table: "CompetencyAttributes",
                type: "nvarchar(128)",
                maxLength: 128,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GoalkeeperName",
                table: "Competencies",
                type: "nvarchar(128)",
                maxLength: 128,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_CompetencyFrameworkCompetencyDescriptions_FrameworkId_CompetencyId_Band_IsGoalkeeper",
                table: "CompetencyFrameworkCompetencyDescriptions",
                columns: new[] { "FrameworkId", "CompetencyId", "Band", "IsGoalkeeper" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CompetencyFrameworkAttributeWeights_FrameworkId_AttributeId_Format_IsGoalkeeper",
                table: "CompetencyFrameworkAttributeWeights",
                columns: new[] { "FrameworkId", "AttributeId", "Format", "IsGoalkeeper" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CompetencyFrameworkCompetencyDescriptions_FrameworkId_CompetencyId_Band_IsGoalkeeper",
                table: "CompetencyFrameworkCompetencyDescriptions");

            migrationBuilder.DropIndex(
                name: "IX_CompetencyFrameworkAttributeWeights_FrameworkId_AttributeId_Format_IsGoalkeeper",
                table: "CompetencyFrameworkAttributeWeights");

            migrationBuilder.DropColumn(
                name: "IsGoalkeeper",
                table: "CompetencyFrameworkCompetencyDescriptions");

            migrationBuilder.DropColumn(
                name: "IsGoalkeeper",
                table: "CompetencyFrameworkAttributeWeights");

            migrationBuilder.DropColumn(
                name: "GoalkeeperName",
                table: "CompetencyAttributes");

            migrationBuilder.DropColumn(
                name: "GoalkeeperName",
                table: "Competencies");

            migrationBuilder.CreateIndex(
                name: "IX_CompetencyFrameworkCompetencyDescriptions_FrameworkId_CompetencyId_Band",
                table: "CompetencyFrameworkCompetencyDescriptions",
                columns: new[] { "FrameworkId", "CompetencyId", "Band" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CompetencyFrameworkAttributeWeights_FrameworkId_AttributeId_Format",
                table: "CompetencyFrameworkAttributeWeights",
                columns: new[] { "FrameworkId", "AttributeId", "Format" },
                unique: true);
        }
    }
}
