using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OurGame.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RemoveCoachRoleAddClubRolesAndBadges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Role",
                table: "Coaches");

            migrationBuilder.AddColumn<string>(
                name: "Badges",
                table: "Coaches",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ClubRoles",
                table: "Coaches",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Badges",
                table: "Coaches");

            migrationBuilder.DropColumn(
                name: "ClubRoles",
                table: "Coaches");

            migrationBuilder.AddColumn<int>(
                name: "Role",
                table: "Coaches",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
