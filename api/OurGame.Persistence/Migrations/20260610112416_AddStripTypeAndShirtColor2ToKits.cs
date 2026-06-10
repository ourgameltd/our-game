using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OurGame.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddStripTypeAndShirtColor2ToKits : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ShirtColor2",
                table: "Kits",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StripType",
                table: "Kits",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ShirtColor2",
                table: "Kits");

            migrationBuilder.DropColumn(
                name: "StripType",
                table: "Kits");
        }
    }
}
