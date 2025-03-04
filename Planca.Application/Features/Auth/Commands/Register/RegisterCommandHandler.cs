using MediatR;
using Microsoft.Extensions.Logging;
using Planca.Application.Common.Interfaces;
using Planca.Application.Common.Models;
using Planca.Domain.Common.Enums;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Features.Auth.Commands.Register
{
    public class RegisterCommandHandler : IRequestHandler<RegisterCommand, Result<AuthResponse>>
    {
        private readonly IIdentityService _identityService;
        private readonly ITokenService _tokenService;
        private readonly IAppSettings _appSettings;
        private readonly IRepository<Customer> _customerRepository;
        private readonly IRepository<Employee> _employeeRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<RegisterCommandHandler> _logger;

        public RegisterCommandHandler(
            IIdentityService identityService,
            ITokenService tokenService,
            IAppSettings appSettings,
            IRepository<Customer> customerRepository,
            IRepository<Employee> employeeRepository,
            IUnitOfWork unitOfWork,
            ILogger<RegisterCommandHandler> logger)
        {
            _identityService = identityService;
            _tokenService = tokenService;
            _appSettings = appSettings;
            _customerRepository = customerRepository;
            _employeeRepository = employeeRepository;
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<Result<AuthResponse>> Handle(RegisterCommand request, CancellationToken cancellationToken)
        {
            try
            {
                // Check if email already exists
                var existingUser = await _identityService.FindByEmailAsync(request.Email);
                if (existingUser.Result.Succeeded)
                {
                    _logger.LogWarning("Registration failed: Email {Email} is already registered", request.Email);
                    return Result<AuthResponse>.Failure("Email is already registered");
                }

                // Create the user
                var (createResult, userId) = await _identityService.CreateUserAsync(
                    request.Email,
                    request.Email,
                    request.Password);

                if (!createResult.Succeeded)
                {
                    _logger.LogWarning("User creation failed for {Email}: {Errors}",
                        request.Email, string.Join(", ", createResult.Errors));
                    return Result<AuthResponse>.Failure(createResult.Errors);
                }

                // Begin transaction for consistency between Identity and Domain entities
                await _unitOfWork.BeginTransactionAsync();

                try
                {
                    // Update user basic data
                    var userData = new UserBasicData
                    {
                        FirstName = request.FirstName,
                        LastName = request.LastName,
                        Email = request.Email,
                        PhoneNumber = request.PhoneNumber,
                        TenantId = request.TenantId
                    };

                    var updateResult = await _identityService.UpdateUserBasicDataAsync(userId, userData);
                    if (!updateResult.Succeeded)
                    {
                        _logger.LogWarning("User data update failed for {Email}: {Errors}",
                            request.Email, string.Join(", ", updateResult.Errors));

                        // Rollback and return failure
                        await _unitOfWork.RollbackTransactionAsync();
                        return Result<AuthResponse>.Failure("Failed to update user data");
                    }

                    // Add user to role
                    var roleResult = await _identityService.AddToRoleAsync(userId, request.Role);
                    if (!roleResult.Succeeded)
                    {
                        _logger.LogWarning("Role assignment failed for {Email}: {Errors}",
                            request.Email, string.Join(", ", roleResult.Errors));

                        // Rollback and return failure
                        await _unitOfWork.RollbackTransactionAsync();
                        return Result<AuthResponse>.Failure("Failed to assign role");
                    }

                    // Create domain entity based on role
                    if (request.Role == UserRoles.Customer)
                    {
                        await CreateCustomerEntity(userId, request);
                    }
                    else if (request.Role == UserRoles.Employee)
                    {
                        await CreateEmployeeEntity(userId, request);
                    }

                    // Save all changes
                    await _unitOfWork.SaveChangesAsync(cancellationToken);

                    // Get user roles
                    var roles = await _identityService.GetUserRolesAsync(userId);

                    // Generate JWT token
                    var token = _tokenService.CreateToken(
                        userId,
                        request.Email,
                        roles,
                        request.TenantId.ToString());

                    // Generate refresh token
                    var refreshToken = Guid.NewGuid().ToString();
                    var refreshTokenExpiryDays = _appSettings.RefreshTokenExpiryDays;
                    var refreshTokenExpiryTime = DateTime.UtcNow.AddDays(refreshTokenExpiryDays);

                    // Store refresh token
                    await _identityService.UpdateUserRefreshTokenAsync(userId, refreshToken, refreshTokenExpiryTime);

                    // Commit transaction
                    await _unitOfWork.CommitTransactionAsync();

                    // Create response
                    var response = new AuthResponse
                    {
                        Token = token,
                        RefreshToken = refreshToken,
                        UserId = userId,
                        UserName = $"{request.FirstName} {request.LastName}",
                        Email = request.Email,
                        Roles = roles.ToArray()
                    };

                    _logger.LogInformation("User {Email} registered successfully with role {Role}", request.Email, request.Role);
                    return Result<AuthResponse>.Success(response);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error during transaction for user registration: {Email}", request.Email);

                    // Rollback transaction
                    await _unitOfWork.RollbackTransactionAsync();

                    // Delete the created user to ensure consistency
                    await _identityService.DeleteUserAsync(userId);

                    return Result<AuthResponse>.Failure($"Registration failed: {ex.Message}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user registration: {Email}", request.Email);
                return Result<AuthResponse>.Failure($"Registration failed: {ex.Message}");
            }
        }

        private async Task CreateCustomerEntity(string userId, RegisterCommand request)
        {
            var customer = new Customer
            {
                UserId = userId,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                PhoneNumber = request.PhoneNumber,
                TenantId = request.TenantId,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "System"
            };

            await _customerRepository.AddAsync(customer);
        }

        private async Task CreateEmployeeEntity(string userId, RegisterCommand request)
        {
            var employee = new Employee
            {
                UserId = userId,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                PhoneNumber = request.PhoneNumber,
                Title = "New Employee",
                IsActive = true,
                TenantId = request.TenantId,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "System"
            };

            await _employeeRepository.AddAsync(employee);
        }
    }
}