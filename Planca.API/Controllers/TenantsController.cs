using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Planca.Application.Features.Tenants.Commands.CreateTenant;
using Planca.Application.Features.Tenants.Commands.UpdateTenant;
using Planca.Application.Features.Tenants.Commands.DeleteTenant;
using Planca.Application.Features.Tenants.Queries.GetTenantDetail;
using Planca.Application.Features.Tenants.Queries.GetTenantsList;
using System;
using System.Threading.Tasks;

namespace Planca.API.Controllers
{
    [Authorize(Roles = "SuperAdmin")]
    [Route("api/[controller]")]
    [ApiController]
    public class TenantsController : BaseApiController
    {
        [HttpGet]
        public async Task<ActionResult> GetTenants([FromQuery] GetTenantsListQuery query)
        {
            var result = await Mediator.Send(query);
            return HandlePagedResult(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetTenant(Guid id)
        {
            var result = await Mediator.Send(new GetTenantDetailQuery { Id = id });
            return HandleResult(result);
        }

        [HttpPost]
        public async Task<ActionResult> CreateTenant(CreateTenantCommand command)
        {
            var result = await Mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateTenant(Guid id, UpdateTenantCommand command)
        {
            if (id != command.Id)
                return BadRequest("ID in URL does not match ID in request body");

            var result = await Mediator.Send(command);
            return HandleResult(result);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteTenant(Guid id)
        {
            var result = await Mediator.Send(new DeleteTenantCommand { Id = id });
            return HandleResult(result);
        }
    }
}