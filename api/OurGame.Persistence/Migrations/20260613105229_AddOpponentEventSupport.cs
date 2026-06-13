using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OurGame.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddOpponentEventSupport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Guid>(
                name: "PlayerId",
                table: "Injuries",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AddColumn<bool>(
                name: "IsOpponent",
                table: "Injuries",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "OpponentJerseyNumber",
                table: "Injuries",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OpponentName",
                table: "Injuries",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "PlayerId",
                table: "Goals",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AddColumn<bool>(
                name: "IsOpponent",
                table: "Goals",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "OpponentJerseyNumber",
                table: "Goals",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OpponentName",
                table: "Goals",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "PlayerId",
                table: "Cards",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AddColumn<bool>(
                name: "IsOpponent",
                table: "Cards",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "OpponentJerseyNumber",
                table: "Cards",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OpponentName",
                table: "Cards",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsOpponent",
                table: "Injuries");

            migrationBuilder.DropColumn(
                name: "OpponentJerseyNumber",
                table: "Injuries");

            migrationBuilder.DropColumn(
                name: "OpponentName",
                table: "Injuries");

            migrationBuilder.DropColumn(
                name: "IsOpponent",
                table: "Goals");

            migrationBuilder.DropColumn(
                name: "OpponentJerseyNumber",
                table: "Goals");

            migrationBuilder.DropColumn(
                name: "OpponentName",
                table: "Goals");

            migrationBuilder.DropColumn(
                name: "IsOpponent",
                table: "Cards");

            migrationBuilder.DropColumn(
                name: "OpponentJerseyNumber",
                table: "Cards");

            migrationBuilder.DropColumn(
                name: "OpponentName",
                table: "Cards");

            migrationBuilder.AlterColumn<Guid>(
                name: "PlayerId",
                table: "Injuries",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "PlayerId",
                table: "Goals",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "PlayerId",
                table: "Cards",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);
        }
    }
}
