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

        // Generic method that returns ActionResult<T>
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

        // Non-generic method for void results, returns ActionResult
        protected ActionResult HandleResult(Result result)
        {
            if (result == null)
                return NotFound();

            if (result.Succeeded)
                return Ok();

            return BadRequest(new { Errors = result.Errors });
        }

        // Method to convert ActionResult<T> to ActionResult for controller methods expecting ActionResult
        protected ActionResult HandleActionResult<T>(Result<T> result)
        {
            if (result == null)
                return NotFound();

            if (result.Succeeded && result.Data != null)
                return Ok(result.Data);

            if (result.Succeeded && result.Data == null)
                return NotFound();

            return BadRequest(new { Errors = result.Errors });
        }

        // Method for paginated results
        protected ActionResult HandlePagedResult<T>(PaginatedList<T> result)
        {
            if (result == null)
                return NotFound();

            return Ok(new
            {
                items = result.Items,
                pageNumber = result.PageNumber,
                totalPages = result.TotalPages,
                totalCount = result.TotalCount,
                hasNextPage = result.HasNextPage,
                hasPreviousPage = result.HasPreviousPage
            });
        }
    }
}