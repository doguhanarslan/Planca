using MediatR;
using Planca.Application.Common.Models;

public class RegisterCommand : IRequest<Result<AuthResponse>>
{
    public string Email { get; set; }
    public string Password { get; set; }
    public string ConfirmPassword { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string PhoneNumber { get; set; }

    // Default olarak Customer rolü
    public string Role { get; set; } = "Customer";

    // Opsiyonel TenantId - işletme kurma adımında doldurulacak
    public Guid? TenantId { get; set; }
}