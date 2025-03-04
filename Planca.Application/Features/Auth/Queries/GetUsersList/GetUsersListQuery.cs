using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using System;

namespace Planca.Application.Features.Auth.Queries.GetUsersList
{
    public class GetUsersListQuery : IRequest<PaginatedList<UserListItemDto>>, ITenantRequest
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SearchString { get; set; }
        public string Role { get; set; }
        public string SortBy { get; set; } = "UserName";
        public bool SortAscending { get; set; } = true;

        // Will be set by TenantBehavior
        public Guid TenantId { get; set; }
    }
}