using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OurGame.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTacticPrinciplePositionOverrides : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TacticPrinciplePositionOverrides",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TacticPrincipleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PositionIndex = table.Column<int>(type: "int", nullable: false),
                    XCoord = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    YCoord = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Direction = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TacticPrinciplePositionOverrides", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TacticPrinciplePositionOverrides_TacticPrinciples_TacticPrincipleId",
                        column: x => x.TacticPrincipleId,
                        principalTable: "TacticPrinciples",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TacticPrinciplePositionOverrides_TacticPrincipleId_PositionIndex",
                table: "TacticPrinciplePositionOverrides",
                columns: new[] { "TacticPrincipleId", "PositionIndex" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TacticPrinciplePositionOverrides");
        }
    }
}
