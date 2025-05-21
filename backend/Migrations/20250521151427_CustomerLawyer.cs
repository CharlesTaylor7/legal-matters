using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LegalMatters.Migrations
{
    /// <inheritdoc />
    public partial class CustomerLawyer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "LawyerId",
                table: "Customers",
                type: "integer",
                nullable: false,
                defaultValue: 0
            );

            migrationBuilder.CreateIndex(
                name: "IX_Customers_LawyerId",
                table: "Customers",
                column: "LawyerId"
            );

            migrationBuilder.AddForeignKey(
                name: "FK_Customers_AspNetUsers_LawyerId",
                table: "Customers",
                column: "LawyerId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Customers_AspNetUsers_LawyerId",
                table: "Customers"
            );

            migrationBuilder.DropIndex(name: "IX_Customers_LawyerId", table: "Customers");

            migrationBuilder.DropColumn(name: "LawyerId", table: "Customers");
        }
    }
}
