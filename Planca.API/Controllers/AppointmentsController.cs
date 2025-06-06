﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Planca.Application.DTOs;
using Planca.Application.Features.Appointments.Commands.CreateAppointment;
using Planca.Application.Features.Appointments.Commands.UpdateAppointment;
using Planca.Application.Features.Appointments.Commands.DeleteAppointment;
using Planca.Application.Features.Appointments.Commands.CancelAppointment;
using Planca.Application.Features.Appointments.Commands.ConfirmAppointment;
using Planca.Application.Features.Appointments.Queries.GetAppointmentDetail;
using Planca.Application.Features.Appointments.Queries.GetAppointmentsList;
using Planca.Application.Features.Appointments.Queries.GetEmployeeAppointments;
using Planca.Application.Features.Appointments.Queries.GetCustomerAppointments;
using System;
using System.Threading.Tasks;

namespace Planca.API.Controllers
{
    [Authorize]
    public class AppointmentsController : BaseApiController
    {
        [HttpGet]
        public async Task<ActionResult> GetAppointments([FromQuery] GetAppointmentsListQuery query)
        {
            var result = await Mediator.Send(query);
            return HandlePagedResult(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetAppointment(Guid id)
        {
            var result = await Mediator.Send(new GetAppointmentDetailQuery { Id = id });
            return HandleActionResult(result);
        }

        [HttpGet("employee/{employeeId}")]
        public async Task<ActionResult> GetEmployeeAppointments(Guid employeeId, DateTime startDate, DateTime endDate)
        {
            var result = await Mediator.Send(new GetEmployeeAppointmentsQuery
            {
                EmployeeId = employeeId,
                StartDate = startDate,
                EndDate = endDate
            });
            return HandleActionResult(result);
        }

        [HttpGet("customer/{customerId}")]
        public async Task<ActionResult> GetCustomerAppointments(Guid customerId)
        {
            var result = await Mediator.Send(new GetCustomerAppointmentsQuery
            {
                CustomerId = customerId
            });
            return HandleActionResult(result);
        }

        [HttpPost]
        public async Task<ActionResult> CreateAppointment(CreateAppointmentCommand command)
        {
            var result = await Mediator.Send(command);
            return HandleActionResult(result);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateAppointment(Guid id, UpdateAppointmentCommand command)
        {
            if (id != command.Id)
                return BadRequest("ID in URL does not match ID in request body");

            var result = await Mediator.Send(command);
            return HandleActionResult(result);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteAppointment(Guid id)
        {
            var result = await Mediator.Send(new DeleteAppointmentCommand { Id = id });
            return HandleResult(result);
        }

        [HttpPost("{id}/cancel")]
        public async Task<ActionResult> CancelAppointment(Guid id, [FromBody] CancelAppointmentCommand command)
        {
            if (id != command.Id)
                return BadRequest("ID in URL does not match ID in request body");

            var result = await Mediator.Send(command);
            return HandleActionResult(result);
        }

        [HttpPost("{id}/confirm")]
        public async Task<ActionResult> ConfirmAppointment(Guid id)
        {
            var result = await Mediator.Send(new ConfirmAppointmentCommand { Id = id });
            return HandleActionResult(result);
        }
    }
}