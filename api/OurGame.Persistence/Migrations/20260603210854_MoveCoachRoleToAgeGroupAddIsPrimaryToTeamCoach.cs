using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OurGame.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class MoveCoachRoleToAgeGroupAddIsPrimaryToTeamCoach : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Role",
                table: "TeamCoaches");

            migrationBuilder.AddColumn<bool>(
                name: "IsPrimary",
                table: "TeamCoaches",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "Role",
                table: "AgeGroupCoordinators",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsPrimary",
                table: "TeamCoaches");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "AgeGroupCoordinators");

            migrationBuilder.AddColumn<int>(
                name: "Role",
                table: "TeamCoaches",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
