using MediatR;
using Shopfloor.Application.Common;
using Shopfloor.Application.Dtos;
using Shopfloor.Domain.Common;
using Shopfloor.Domain.Repositories;

namespace Shopfloor.Application.Features.Auth;

public sealed record LoginCommand(string Username, string Password) : IRequest<AuthDto>;

public sealed class LoginCommandHandler(IUserRepository users, IPasswordHasher passwordHasher, ITokenService tokenService,
    IMasterAdminAuthenticator masterAdmin, IUnitOfWork unitOfWork)
    : IRequestHandler<LoginCommand, AuthDto>
{
    public async Task<AuthDto> Handle(LoginCommand request, CancellationToken ct)
    {
        var identifier = request.Username.Trim();
        var user = masterAdmin.Authenticate(identifier, request.Password)
            ?? await users.FindByUsernameOrEmailAsync(identifier, ct);
        if (user is null || !user.IsActive ||
            (!string.Equals(user.ExternalId, "master:admin", StringComparison.Ordinal) &&
             !passwordHasher.Verify(request.Password, user.PasswordHash, user.PasswordSalt)))
            throw new UnauthorizedException("Usuário ou senha inválidos.");
        await users.SyncLocalUserAsync(user, ct);
        await unitOfWork.SaveChangesAsync(ct);
        return new AuthDto(user.Id, user.Username, user.Name, user.Email, user.Type, user.Image, tokenService.Create(user));
    }
}
