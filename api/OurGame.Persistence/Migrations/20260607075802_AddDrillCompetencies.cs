using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OurGame.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddDrillCompetencies : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AggregatedAttributes",
                table: "DrillTemplates");

            migrationBuilder.DropColumn(
                name: "Attributes",
                table: "Drills");

            migrationBuilder.CreateTable(
                name: "DrillCompetencies",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DrillId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CompetencyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DrillCompetencies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DrillCompetencies_Competencies_CompetencyId",
                        column: x => x.CompetencyId,
                        principalTable: "Competencies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DrillCompetencies_Drills_DrillId",
                        column: x => x.DrillId,
                        principalTable: "Drills",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DrillCompetencies_CompetencyId",
                table: "DrillCompetencies",
                column: "CompetencyId");

            migrationBuilder.CreateIndex(
                name: "IX_DrillCompetencies_DrillId_CompetencyId",
                table: "DrillCompetencies",
                columns: new[] { "DrillId", "CompetencyId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DrillCompetencies");

            migrationBuilder.AddColumn<string>(
                name: "AggregatedAttributes",
                table: "DrillTemplates",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Attributes",
                table: "Drills",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
