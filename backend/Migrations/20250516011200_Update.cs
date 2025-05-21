using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaxCalculator.Migrations
{
    /// <inheritdoc />
    public partial class Update : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "Rate", table: "TaxBands");

            migrationBuilder.DropColumn(name: "UpperLimit", table: "TaxBands");

            migrationBuilder.AddColumn<int>(
                name: "PercentageRate",
                table: "TaxBands",
                type: "integer",
                nullable: false,
                defaultValue: 0
            );

            migrationBuilder.UpdateData(
                table: "TaxBands",
                keyColumn: "Id",
                keyValue: 1,
                column: "PercentageRate",
                value: 0
            );

            migrationBuilder.UpdateData(
                table: "TaxBands",
                keyColumn: "Id",
                keyValue: 2,
                column: "PercentageRate",
                value: 20
            );

            migrationBuilder.UpdateData(
                table: "TaxBands",
                keyColumn: "Id",
                keyValue: 3,
                column: "PercentageRate",
                value: 40
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "PercentageRate", table: "TaxBands");

            migrationBuilder.AddColumn<decimal>(
                name: "Rate",
                table: "TaxBands",
                type: "numeric",
                nullable: false,
                defaultValue: 0m
            );

            migrationBuilder.AddColumn<int>(
                name: "UpperLimit",
                table: "TaxBands",
                type: "integer",
                nullable: true
            );

            migrationBuilder.UpdateData(
                table: "TaxBands",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Rate", "UpperLimit" },
                values: new object[] { 0m, 5000 }
            );

            migrationBuilder.UpdateData(
                table: "TaxBands",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Rate", "UpperLimit" },
                values: new object[] { 20m, 20000 }
            );

            migrationBuilder.UpdateData(
                table: "TaxBands",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Rate", "UpperLimit" },
                values: new object[] { 40m, null }
            );
        }
    }
}
