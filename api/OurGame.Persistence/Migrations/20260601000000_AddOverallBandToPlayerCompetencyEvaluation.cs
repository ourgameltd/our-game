using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using OurGame.Persistence.Models;

#nullable disable

namespace OurGame.Persistence.Migrations
{
    [DbContext(typeof(OurGameContext))]
    [Migration("20260601000000_AddOverallBandToPlayerCompetencyEvaluation")]
    public partial class AddOverallBandToPlayerCompetencyEvaluation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "OverallBand",
                table: "PlayerCompetencyEvaluations",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OverallBand",
                table: "PlayerCompetencyEvaluations");
        }
    }
}
