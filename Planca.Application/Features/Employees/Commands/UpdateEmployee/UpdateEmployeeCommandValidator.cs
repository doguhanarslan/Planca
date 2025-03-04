using FluentValidation;
using System;

namespace Planca.Application.Features.Employees.Commands.UpdateEmployee
{
    public class UpdateEmployeeCommandValidator : AbstractValidator<UpdateEmployeeCommand>
    {
        public UpdateEmployeeCommandValidator()
        {
            RuleFor(v => v.Id)
                .NotEmpty().WithMessage("Employee ID is required");

            RuleFor(v => v.FirstName)
                .NotEmpty().WithMessage("First name is required")
                .MaximumLength(100).WithMessage("First name must not exceed 100 characters");

            RuleFor(v => v.LastName)
                .NotEmpty().WithMessage("Last name is required")
                .MaximumLength(100).WithMessage("Last name must not exceed 100 characters");

            RuleFor(v => v.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Email is not valid")
                .MaximumLength(255).WithMessage("Email must not exceed 255 characters");

            RuleFor(v => v.PhoneNumber)
                .MaximumLength(20).WithMessage("Phone number must not exceed 20 characters");

            RuleFor(v => v.Title)
                .NotEmpty().WithMessage("Title is required")
                .MaximumLength(100).WithMessage("Title must not exceed 100 characters");

            // WorkingHours için validasyon
            RuleForEach(v => v.WorkingHours)
                .ChildRules(workingHours => {
                    workingHours.RuleFor(w => w.StartTime)
                        .LessThan(w => w.EndTime)
                        .When(w => w.IsWorkingDay)
                        .WithMessage("Start time must be less than end time");
                });

            // ServiceIds için validasyon
            RuleFor(v => v.ServiceIds)
                .NotEmpty().WithMessage("At least one service must be selected");
        }
    }
}