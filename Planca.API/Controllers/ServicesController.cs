using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Planca.Application.Features.Services.Commands.CreateService;
using Planca.Application.Features.Services.Commands.UpdateService;
using Planca.Application.Features.Services.Commands.DeleteService;
using Planca.Application.Features.Services.Queries.GetServiceDetail;
using Planca.Application.Features.Services.Queries.GetServicesList;
using System;
using System.Threading.Tasks;

namespace Planca.API.Controllers
{
    [Authorize]
    public class ServicesController : BaseApiController
    {
        [HttpGet]
        [AllowAnonymous] // Services can be viewed without authentication
        public async Task<ActionResult> GetServices([FromQuery] GetServicesListQuery query)
        {
            var result = await Mediator.Send(query);
            return HandlePagedResult(result);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult> GetService(Guid id)
        {
            var result = await Mediator.Send(new GetServiceDetailQuery { Id = id });
            return HandleActionResult(result);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> CreateService(CreateServiceCommand command)
        {
            var result = await Mediator.Send(command);
            return HandleActionResult(result);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> UpdateService(Guid id, UpdateServiceCommand command)
        {
            if (id != command.Id)
                return BadRequest("ID in URL does not match ID in request body");

            var result = await Mediator.Send(command);
            return HandleActionResult(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteService(Guid id)
        {
            var result = await Mediator.Send(new DeleteServiceCommand { Id = id });
            return HandleResult(result);
        }
    }
}