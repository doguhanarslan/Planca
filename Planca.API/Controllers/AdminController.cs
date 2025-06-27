using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace Planca.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : BaseApiController
    {
        public AdminController()
        {
        }

        /// <summary>
        /// Admin sağlık durumu kontrolü
        /// </summary>
        [HttpGet("health")]
        public ActionResult GetHealthCheck()
        {
            return Ok(new { 
                status = "healthy",
                timestamp = DateTime.UtcNow,
                message = "Admin endpoints are operational"
            });
        }
    }
} 