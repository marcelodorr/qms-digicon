using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shopfloor.Application.Dtos;
using Shopfloor.Application.Features.Auth;

namespace Shopfloor.API.Controllers;

[ApiController, Route("api/auth")]
public sealed class AuthController(IMediator mediator) : ControllerBase
{
    [AllowAnonymous, HttpPost("login")]
    public Task<AuthDto> Login(LoginRequest request, CancellationToken ct) => mediator.Send(new LoginCommand(request.Username, request.Password), ct);
}
