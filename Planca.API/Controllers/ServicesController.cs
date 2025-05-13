using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Planca.Application.Features.Services.Commands.CreateService;
using Planca.Application.Features.Services.Commands.UpdateService;
using Planca.Application.Features.Services.Commands.DeleteService;
using Planca.Application.Features.Services.Queries.GetServiceDetail;
using Planca.Application.Features.Services.Queries.GetServicesList;
using System;
using System.Threading.Tasks;
using Planca.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace Planca.API.Controllers
{
    [Authorize]
    public class ServicesController : BaseApiController
    {
        private readonly ICurrentTenantService _currentTenantService;
        private readonly ILogger<ServicesController> _logger;

        public ServicesController(ICurrentTenantService currentTenantService, ILogger<ServicesController> logger)
        {
            _currentTenantService = currentTenantService;
            _logger = logger;
        }

        [HttpGet]
        [AllowAnonymous] // Services can be viewed without authentication
        public async Task<ActionResult> GetServices([FromQuery] GetServicesListQuery query)
        {
            // Mevcut tenant ID'yi logla
            var currentServiceTenantId = _currentTenantService.GetTenantId();
            _logger.LogInformation("BAŞLANGIÇ - CurrentTenantService.GetTenantId(): {TenantId}", currentServiceTenantId);
            
            // TenantId kontrolü - Header'dan gelen değeri önceliklendir
            var tenantIdHeader = Request.Headers["X-TenantId"].ToString();
            if (!string.IsNullOrEmpty(tenantIdHeader) && Guid.TryParse(tenantIdHeader, out var headerTenantId))
            {
                _logger.LogInformation("Overriding TenantId from header: {TenantId}", headerTenantId);
                query.TenantId = headerTenantId;
                
                // CurrentTenantService'i de güncelle
                _currentTenantService.SetCurrentTenantId(headerTenantId);
                
                // Güncelleme sonrası değeri kontrol et
                var afterHeaderUpdate = _currentTenantService.GetTenantId();
                _logger.LogInformation("HEADER UPDATE SONRASI - CurrentTenantService.GetTenantId(): {TenantId}", afterHeaderUpdate);
            }
            
            // Eğer hala geçersiz bir tenant ID varsa, hata döndür 
            if (query.TenantId == Guid.Empty)
            {
                _logger.LogWarning("Invalid empty TenantId provided in request");
                return BadRequest("Geçerli bir TenantId gereklidir");
            }

            // Son kontrolden sonra tenant ID'yi log ve güncelle
            _logger.LogInformation("Controller: Using TenantId: {TenantId}", query.TenantId);
            _currentTenantService.SetCurrentTenantId(query.TenantId);
            
            // Tekrar kontrol et
            var finalTenantId = _currentTenantService.GetTenantId();
            _logger.LogInformation("SON DURUM - CurrentTenantService.GetTenantId(): {TenantId}", finalTenantId);
            
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