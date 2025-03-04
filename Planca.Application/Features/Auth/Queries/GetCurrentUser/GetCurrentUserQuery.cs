using MediatR;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;

namespace Planca.Application.Features.Auth.Queries.GetCurrentUser
{
    public class GetCurrentUserQuery : IRequest<Result<UserDto>>
    {
        // No properties needed - the user will be determined from the JWT token
    }
}