using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OurGame.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class MergePlayerParentsIntoEmergencyContacts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Relationship",
                table: "EmergencyContacts",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "PlayerId",
                table: "EmergencyContacts",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AlterColumn<string>(
                name: "Phone",
                table: "EmergencyContacts",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "EmergencyContacts",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CoachId",
                table: "EmergencyContacts",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "EmergencyContacts",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_EmergencyContacts_CoachId",
                table: "EmergencyContacts",
                column: "CoachId");

            migrationBuilder.CreateIndex(
                name: "IX_EmergencyContacts_UserId",
                table: "EmergencyContacts",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_EmergencyContacts_Coaches_CoachId",
                table: "EmergencyContacts",
                column: "CoachId",
                principalTable: "Coaches",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_EmergencyContacts_Users_UserId",
                table: "EmergencyContacts",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            // Migrate PlayerParents data into EmergencyContacts before dropping the table
            migrationBuilder.Sql(@"
                INSERT INTO EmergencyContacts (Id, PlayerId, CoachId, UserId, Name, Phone, Relationship, IsPrimary)
                SELECT 
                    NEWID(),
                    pp.PlayerId,
                    NULL,
                    pp.ParentUserId,
                    LTRIM(RTRIM(pp.FirstName + ' ' + pp.LastName)),
                    pp.Phone,
                    'Parent',
                    0
                FROM PlayerParents pp
                WHERE NOT EXISTS (
                    SELECT 1 FROM EmergencyContacts ec 
                    WHERE ec.PlayerId = pp.PlayerId 
                      AND ec.Name = LTRIM(RTRIM(pp.FirstName + ' ' + pp.LastName))
                )
            ");

            migrationBuilder.DropTable(
                name: "PlayerParents");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EmergencyContacts_Coaches_CoachId",
                table: "EmergencyContacts");

            migrationBuilder.DropForeignKey(
                name: "FK_EmergencyContacts_Users_UserId",
                table: "EmergencyContacts");

            migrationBuilder.DropIndex(
                name: "IX_EmergencyContacts_CoachId",
                table: "EmergencyContacts");

            migrationBuilder.DropIndex(
                name: "IX_EmergencyContacts_UserId",
                table: "EmergencyContacts");

            migrationBuilder.DropColumn(
                name: "CoachId",
                table: "EmergencyContacts");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "EmergencyContacts");

            migrationBuilder.AlterColumn<string>(
                name: "Relationship",
                table: "EmergencyContacts",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "PlayerId",
                table: "EmergencyContacts",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Phone",
                table: "EmergencyContacts",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "EmergencyContacts",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.CreateTable(
                name: "PlayerParents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ParentUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    PlayerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlayerParents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlayerParents_Players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "Players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PlayerParents_Users_ParentUserId",
                        column: x => x.ParentUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PlayerParents_ParentUserId",
                table: "PlayerParents",
                column: "ParentUserId");

            migrationBuilder.CreateIndex(
                name: "IX_PlayerParents_PlayerId",
                table: "PlayerParents",
                column: "PlayerId");
        }
    }
}
