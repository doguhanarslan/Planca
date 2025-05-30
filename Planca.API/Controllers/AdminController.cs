using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Planca.Application.Common.Services;
using System;
using System.Threading.Tasks;

namespace Planca.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : BaseApiController
    {
        private readonly IDataRetentionService _dataRetentionService;

        public AdminController(IDataRetentionService dataRetentionService)
        {
            _dataRetentionService = dataRetentionService;
        }

        /// <summary>
        /// Veri saklama istatistiklerini getirir
        /// </summary>
        [HttpGet("data-retention/stats")]
        public async Task<ActionResult> GetDataRetentionStats()
        {
            var stats = await _dataRetentionService.GetRetentionStatsAsync();
            return Ok(stats);
        }

        /// <summary>
        /// Eski silinen kayıtları temizler (hard delete)
        /// </summary>
        [HttpPost("data-retention/purge")]
        public async Task<ActionResult> PurgeOldDeletedRecords([FromQuery] int retentionDays = 365)
        {
            try
            {
                var retentionPeriod = TimeSpan.FromDays(retentionDays);
                await _dataRetentionService.PurgeOldDeletedRecordsAsync(retentionPeriod);
                
                return Ok(new { 
                    message = $"Successfully purged deleted records older than {retentionDays} days",
                    retentionDays = retentionDays
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { 
                    message = "Error occurred during purge operation",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Tenant bazında eski silinen kayıtları temizler
        /// </summary>
        [HttpPost("data-retention/purge-tenant/{tenantId}")]
        public async Task<ActionResult> PurgeTenantDeletedRecords(
            Guid tenantId, 
            [FromQuery] int retentionDays = 365)
        {
            try
            {
                var retentionPeriod = TimeSpan.FromDays(retentionDays);
                await _dataRetentionService.PurgeTenantDeletedRecordsAsync(tenantId, retentionPeriod);
                
                return Ok(new { 
                    message = $"Successfully purged deleted records for tenant {tenantId} older than {retentionDays} days",
                    tenantId = tenantId,
                    retentionDays = retentionDays
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { 
                    message = "Error occurred during tenant purge operation",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Silinen kayıtları arşivler
        /// </summary>
        [HttpPost("data-retention/archive")]
        public async Task<ActionResult> ArchiveDeletedRecords([FromQuery] int archiveAfterDays = 90)
        {
            try
            {
                var archiveAfter = TimeSpan.FromDays(archiveAfterDays);
                await _dataRetentionService.ArchiveDeletedRecordsAsync(archiveAfter);
                
                return Ok(new { 
                    message = $"Successfully archived deleted records older than {archiveAfterDays} days",
                    archiveAfterDays = archiveAfterDays
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { 
                    message = "Error occurred during archive operation",
                    error = ex.Message
                });
            }
        }
    }
} 