using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace TaxCalculator.Migrations
{
    /// <inheritdoc />
    public partial class TaxRuleSet : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TaxRuleSetId",
                table: "TaxBands",
                type: "integer",
                nullable: false,
                defaultValue: 0
            );

            migrationBuilder.CreateTable(
                name: "TaxRuleSets",
                columns: table => new
                {
                    Id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    Name = table.Column<string>(type: "text", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaxRuleSets", x => x.Id);
                }
            );

            migrationBuilder.UpdateData(
                table: "TaxBands",
                keyColumn: "Id",
                keyValue: 1,
                column: "TaxRuleSetId",
                value: 1
            );

            migrationBuilder.UpdateData(
                table: "TaxBands",
                keyColumn: "Id",
                keyValue: 2,
                column: "TaxRuleSetId",
                value: 1
            );

            migrationBuilder.UpdateData(
                table: "TaxBands",
                keyColumn: "Id",
                keyValue: 3,
                column: "TaxRuleSetId",
                value: 1
            );

            migrationBuilder.InsertData(
                table: "TaxRuleSets",
                columns: new[] { "Id", "Name" },
                values: new object[] { 1, "Default" }
            );

            migrationBuilder.CreateIndex(
                name: "IX_TaxBands_TaxRuleSetId",
                table: "TaxBands",
                column: "TaxRuleSetId"
            );

            migrationBuilder.AddForeignKey(
                name: "FK_TaxBands_TaxRuleSets_TaxRuleSetId",
                table: "TaxBands",
                column: "TaxRuleSetId",
                principalTable: "TaxRuleSets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TaxBands_TaxRuleSets_TaxRuleSetId",
                table: "TaxBands"
            );

            migrationBuilder.DropTable(name: "TaxRuleSets");

            migrationBuilder.DropIndex(name: "IX_TaxBands_TaxRuleSetId", table: "TaxBands");

            migrationBuilder.DropColumn(name: "TaxRuleSetId", table: "TaxBands");
        }
    }
}
