using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using OurGame.Persistence.Models;

#nullable disable

namespace OurGame.Persistence.Migrations
{
    [DbContext(typeof(OurGameContext))]
    [Migration("20260416221000_BackfillTrainingSessionCategoryColumn")]
    public partial class BackfillTrainingSessionCategoryColumn : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Intentionally no-op.
            // This migration was introduced to backfill a transient schema drift and is retained
            // only to keep migration history compatibility across local environments.
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Intentionally no-op.
        }
    }
}