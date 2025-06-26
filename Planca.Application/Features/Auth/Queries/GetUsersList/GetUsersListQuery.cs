using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Application.Common.Interfaces;
using System;

namespace Planca.Application.Features.Auth.Queries.GetUsersList
{
    public class GetUsersListQuery : IRequest<PaginatedList<UserListItemDto>>, ITenantRequest, ICacheableQuery<PaginatedList<UserListItemDto>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SearchString { get; set; }
        public string Role { get; set; }
        public string SortBy { get; set; } = "UserName";
        public bool SortAscending { get; set; } = true;

        // Will be set by TenantBehavior
        public Guid TenantId { get; set; }

        public string CacheKey => $"users_list_p{PageNumber}_s{PageSize}_q{SearchString}_r{Role}_sb{SortBy}_sa{SortAscending}";
        public TimeSpan? CacheDuration => TimeSpan.FromMinutes(30);
        public bool BypassCache { get; set; } = false;
    }
}