using Microsoft.AspNetCore.Authorization;
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
using Microsoft.EntityFrameworkCore;
using Planca.Infrastructure.Persistence.Context;
using Planca.Application.Common.Interfaces;

namespace Planca.API.Controllers
{
    [Authorize]
    public class AppointmentsController : BaseApiController
    {
        private readonly ApplicationDbContext _context;
        private readonly ICurrentTenantService _currentTenantService;

        public AppointmentsController(ApplicationDbContext context, ICurrentTenantService currentTenantService)
        {
            _context = context;
            _currentTenantService = currentTenantService;
        }

        [HttpGet]
        public async Task<ActionResult> GetAppointments([FromQuery] GetAppointmentsListQuery query, [FromQuery] bool bypassCache = false)
        {
            // Allow bypassing cache via query parameter for real-time updates
            query.BypassCache = bypassCache;
            
            var result = await Mediator.Send(query);
            
            // Add cache control headers for better performance
            if (bypassCache)
            {
                Response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate");
                Response.Headers.Add("Pragma", "no-cache");
                Response.Headers.Add("Expires", "0");
            }
            else
            {
                Response.Headers.Add("Cache-Control", "public, max-age=10");
            }
            
            return HandlePagedResult(result);
        }

        [HttpGet("debug")]
        [AllowAnonymous]
        public async Task<ActionResult> GetAppointmentsDebug()
        {
            // Global query filter'ları bypass ederek tüm randevuları getir
            var allAppointments = await _context.Appointments
                .IgnoreQueryFilters()
                .Take(10)
                .Select(a => new {
                    a.Id,
                    a.CustomerId,
                    a.EmployeeId,
                    a.ServiceId,
                    a.StartTime,
                    a.EndTime,
                    a.Status,
                    a.TenantId,
                    a.IsDeleted,
                    a.CreatedAt
                })
                .ToListAsync();

            return Ok(new { 
                Message = "Debug - Tüm randevular (filter olmadan)",
                Count = allAppointments.Count,
                Data = allAppointments 
            });
        }

        [HttpGet("debug/tenant")]
        [AllowAnonymous]
        public async Task<ActionResult> GetTenantDebug()
        {
            // Mevcut tenant ID'yi al
            var currentTenantId = _currentTenantService.GetTenantId();
            
            // Normal query ile randevuları getir (filter'lar ile)
            var filteredAppointments = await _context.Appointments
                .Take(10)
                .Select(a => new {
                    a.Id,
                    a.TenantId,
                    a.IsDeleted,
                    a.StartTime
                })
                .ToListAsync();

            return Ok(new { 
                Message = "Debug - Tenant bilgisi ve filtrelenmiş randevular",
                CurrentTenantId = currentTenantId,
                FilteredAppointmentsCount = filteredAppointments.Count,
                FilteredAppointments = filteredAppointments
            });
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
            try
            {
                var result = await Mediator.Send(new DeleteAppointmentCommand { Id = id });
                
                if (result.Succeeded)
                {
                    // Add headers to prevent caching and signal immediate update
                    Response.Headers.Add("X-Cache-Invalidated", "true");
                    Response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate");
                    
                    return Ok(new { 
                        success = true, 
                        message = "Appointment deleted successfully",
                        timestamp = DateTime.UtcNow 
                    });
                }
                
                return BadRequest(new { 
                    success = false, 
                    message = string.Join(", ", result.Errors),
                    timestamp = DateTime.UtcNow 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    success = false, 
                    message = "An error occurred while deleting the appointment",
                    error = ex.Message,
                    timestamp = DateTime.UtcNow 
                });
            }
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