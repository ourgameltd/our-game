using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OurGame.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddMatchEventTimelineFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "Minute",
                table: "MatchSubstitutions",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "AddedTimeMinutes",
                table: "MatchSubstitutions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Period",
                table: "MatchSubstitutions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Minute",
                table: "Injuries",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "AddedTimeMinutes",
                table: "Injuries",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Period",
                table: "Injuries",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AddedTimeMinutes",
                table: "Goals",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsExtraTime",
                table: "Goals",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsPenalty",
                table: "Goals",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Period",
                table: "Goals",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Minute",
                table: "Cards",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "AddedTimeMinutes",
                table: "Cards",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Period",
                table: "Cards",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AddedTimeMinutes",
                table: "MatchSubstitutions");

            migrationBuilder.DropColumn(
                name: "Period",
                table: "MatchSubstitutions");

            migrationBuilder.DropColumn(
                name: "AddedTimeMinutes",
                table: "Injuries");

            migrationBuilder.DropColumn(
                name: "Period",
                table: "Injuries");

            migrationBuilder.DropColumn(
                name: "AddedTimeMinutes",
                table: "Goals");

            migrationBuilder.DropColumn(
                name: "IsExtraTime",
                table: "Goals");

            migrationBuilder.DropColumn(
                name: "IsPenalty",
                table: "Goals");

            migrationBuilder.DropColumn(
                name: "Period",
                table: "Goals");

            migrationBuilder.DropColumn(
                name: "AddedTimeMinutes",
                table: "Cards");

            migrationBuilder.DropColumn(
                name: "Period",
                table: "Cards");

            migrationBuilder.AlterColumn<int>(
                name: "Minute",
                table: "MatchSubstitutions",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Minute",
                table: "Injuries",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Minute",
                table: "Cards",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);
        }
    }
}
