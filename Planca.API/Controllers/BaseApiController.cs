using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Planca.Application.Common.Models;

namespace Planca.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public abstract class BaseApiController : ControllerBase
    {
        private ISender _mediator = null!;

        protected ISender Mediator => _mediator ??= HttpContext.RequestServices.GetRequiredService<ISender>();

        // Helper methods for standardized responses
        protected ActionResult<T> HandleResult<T>(Result<T> result)
        {
            if (result == null)
                return NotFound();

            if (result.Succeeded && result.Data != null)
                return Ok(result.Data);

            if (result.Succeeded && result.Data == null)
                return NotFound();

            return BadRequest(new { Errors = result.Errors });
        }

        protected ActionResult HandleResult(Result result)
        {
            if (result == null)
                return NotFound();

            if (result.Succeeded)
                return Ok();

            return BadRequest(new { Errors = result.Errors });
        }

        // Yeni eklenen helper metot - ActionResult<T> sonucu ActionResult'a dönüştürmek için
        protected ActionResult HandleActionResult<T>(Result<T> result)
        {
            var actionResult = HandleResult(result);
            return actionResult.Result; // ActionResult<T>'nin Result özelliği ActionResult döndürür
        }

        protected ActionResult<T> HandlePagedResult<T>(PaginatedList<T> result)
        {
            if (result == null)
                return NotFound();

            return Ok(new
            {
                items = result.Items,
                pageNumber = result.PageNumber,
                totalPages = result.TotalPages,
                totalCount = result.TotalCount
            });
        }
    }
}