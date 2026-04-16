using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OurGame.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RemoveTrainingSessionCategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                @"IF COL_LENGTH('TrainingSessions', 'Category') IS NOT NULL
BEGIN
    DECLARE @constraintName nvarchar(128);

    SELECT @constraintName = dc.name
    FROM sys.default_constraints dc
    INNER JOIN sys.columns c
        ON c.default_object_id = dc.object_id
    INNER JOIN sys.tables t
        ON t.object_id = c.object_id
    WHERE t.name = 'TrainingSessions'
      AND c.name = 'Category';

    IF @constraintName IS NOT NULL
        EXEC('ALTER TABLE [TrainingSessions] DROP CONSTRAINT [' + @constraintName + ']');

    ALTER TABLE [TrainingSessions] DROP COLUMN [Category];
END");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                @"IF COL_LENGTH('TrainingSessions', 'Category') IS NULL
BEGIN
    ALTER TABLE [TrainingSessions]
    ADD [Category] nvarchar(100) NOT NULL
        CONSTRAINT [DF_TrainingSessions_Category] DEFAULT N'Whole Part Whole';
END");
        }
    }
}
