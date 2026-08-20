using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddMatriculaToLoginCertification : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "matricula",
                table: "login_certification",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_login_certification_matricula",
                table: "login_certification",
                column: "matricula",
                unique: true,
                filter: "\"matricula\" IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_login_certification_matricula",
                table: "login_certification");

            migrationBuilder.DropColumn(
                name: "matricula",
                table: "login_certification");
        }
    }
}
