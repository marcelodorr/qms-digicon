using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class SeedMasterAdmin : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                INSERT INTO login_certification (username, email, password, salt, type, image)
                SELECT
                    'admin',
                    'admin@local',
                    '8qJ41ssDJ7QzHt78XL1LFB7syHiGPQtHgMVIkSSum8U=',
                    'a11iPaN6gXf0bL5H2HJWjg==',
                    'Admin',
                    NULL
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM login_certification
                    WHERE LOWER(username) = 'admin'
                       OR LOWER(email) = 'admin@local'
                )
                ON CONFLICT DO NOTHING;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DELETE FROM login_certification
                WHERE username = 'admin'
                  AND email = 'admin@local'
                  AND password = '8qJ41ssDJ7QzHt78XL1LFB7syHiGPQtHgMVIkSSum8U='
                  AND salt = 'a11iPaN6gXf0bL5H2HJWjg==';
                """);
        }
    }
}
