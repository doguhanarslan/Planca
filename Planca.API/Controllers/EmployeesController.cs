using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Planca.Application.Features.Employees.Commands.CreateEmployee;
using Planca.Application.Features.Employees.Commands.UpdateEmployee;
using Planca.Application.Features.Employees.Commands.DeleteEmployee;
using Planca.Application.Features.Employees.Queries.GetEmployeeDetail;
using Planca.Application.Features.Employees.Queries.GetEmployeesList;
using Planca.Application.Features.Employees.Queries.GetEmployeesByService;
using System;
using System.Threading.Tasks;

namespace Planca.API.Controllers
{
    [Authorize]
    public class EmployeesController : BaseApiController
    {
        [HttpGet]
        public async Task<ActionResult> GetEmployees([FromQuery] GetEmployeesListQuery query)
        {
            var result = await Mediator.Send(query);
            return HandlePagedResult(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetEmployee(Guid id)
        {
            var result = await Mediator.Send(new GetEmployeeDetailQuery { Id = id });
            return HandleActionResult(result);
        }

        [HttpGet("service/{serviceId}")]
        public async Task<ActionResult> GetEmployeesByService(Guid serviceId)
        {
            var result = await Mediator.Send(new GetEmployeesByServiceQuery { ServiceId = serviceId });
            return HandleActionResult(result);
        }

        [HttpPost]
        //[Authorize(Roles = "Admin")]
        public async Task<ActionResult> CreateEmployee(CreateEmployeeCommand command)
        {
            var result = await Mediator.Send(command);
            return HandleActionResult(result);
        }

        [HttpPut("{id}")]
        //[Authorize(Roles = "Admin")]
        public async Task<ActionResult> UpdateEmployee(Guid id, UpdateEmployeeCommand command)
        {
            if (id != command.Id)
                return BadRequest("ID in URL does not match ID in request body");

            var result = await Mediator.Send(command);
            return HandleActionResult(result);
        }

        [HttpDelete("{id}")]
        //[Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteEmployee(Guid id)
        {
            var result = await Mediator.Send(new DeleteEmployeeCommand { Id = id });
            return HandleResult(result);
        }
    }
}