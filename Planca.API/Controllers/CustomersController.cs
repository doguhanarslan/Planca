using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Planca.Application.Features.Customers.Commands.CreateCustomer;
using Planca.Application.Features.Customers.Commands.UpdateCustomer;
using Planca.Application.Features.Customers.Commands.DeleteCustomer;
using Planca.Application.Features.Customers.Queries.GetCustomerDetail;
using Planca.Application.Features.Customers.Queries.GetCustomersList;
using System;
using System.Threading.Tasks;

namespace Planca.API.Controllers
{
    [Authorize]
    public class CustomersController : BaseApiController
    {
        [HttpGet]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<ActionResult> GetCustomers([FromQuery] GetCustomersListQuery query)
        {
            var result = await Mediator.Send(query);
            return HandlePagedResult(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetCustomer(Guid id)
        {
            var result = await Mediator.Send(new GetCustomerDetailQuery { Id = id });
            return HandleResult(result);
        }

        [HttpPost]
        public async Task<ActionResult> CreateCustomer(CreateCustomerCommand command)
        {
            var result = await Mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateCustomer(Guid id, UpdateCustomerCommand command)
        {
            if (id != command.Id)
                return BadRequest("ID in URL does not match ID in request body");

            var result = await Mediator.Send(command);
            return HandleResult(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteCustomer(Guid id)
        {
            var result = await Mediator.Send(new DeleteCustomerCommand { Id = id });
            return HandleResult(result);
        }
    }
}