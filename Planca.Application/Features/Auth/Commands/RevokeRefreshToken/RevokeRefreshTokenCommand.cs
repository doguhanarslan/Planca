using MediatR;
using Planca.Application.Common.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Planca.Application.Features.Auth.Commands.RevokeRefreshToken
{
    public class RevokeRefreshTokenCommand : IRequest<Result>
    {
        public string UserId { get; set; }
    }
}
