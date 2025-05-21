using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace TaxCalculator.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TaxBands",
                columns: table => new
                {
                    Id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    Name = table.Column<string>(
                        type: "character varying(50)",
                        maxLength: 50,
                        nullable: false
                    ),
                    LowerLimit = table.Column<int>(type: "integer", nullable: false),
                    UpperLimit = table.Column<int>(type: "integer", nullable: true),
                    Rate = table.Column<decimal>(type: "numeric", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaxBands", x => x.Id);
                }
            );

            migrationBuilder.InsertData(
                table: "TaxBands",
                columns: new[] { "Id", "LowerLimit", "Name", "Rate", "UpperLimit" },
                values: new object[,]
                {
                    { 1, 0, "A", 0m, 5000 },
                    { 2, 5000, "B", 20m, 20000 },
                    { 3, 20000, "C", 40m, null },
                }
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "TaxBands");
        }
    }
}
