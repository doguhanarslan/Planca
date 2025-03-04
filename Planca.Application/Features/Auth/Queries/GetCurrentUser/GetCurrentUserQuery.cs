using MediatR;
using Planca.Application.Common.Models;
using Planca.Application.Features.Auth.Commands.Login;

namespace Planca.Application.Features.Auth.Queries.GetCurrentUser
{
    public class GetCurrentUserQuery : IRequest<Result<UserDto>>
    {
        // No properties needed - the user will be determined from the JWT token
    }

    public class UserDto
    {
        public string Id { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }
        public string[] Roles { get; set; }
    }
}