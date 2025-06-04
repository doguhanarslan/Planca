using FluentValidation;

namespace Planca.Application.Features.Settings.Commands.UpdateSettings
{
    public class UpdateSettingsCommandValidator : AbstractValidator<UpdateSettingsCommand>
    {
        public UpdateSettingsCommandValidator()
        {
            RuleFor(x => x.Settings)
                .NotEmpty().WithMessage("At least one setting must be provided");

            RuleForEach(x => x.Settings).ChildRules(setting =>
            {
                setting.RuleFor(s => s.Key)
                    .NotEmpty().WithMessage("Setting key is required")
                    .MaximumLength(100).WithMessage("Setting key must not exceed 100 characters");

                setting.RuleFor(s => s.Value)
                    .MaximumLength(5000).WithMessage("Setting value must not exceed 5000 characters");

                setting.RuleFor(s => s.Category)
                    .NotEmpty().WithMessage("Category is required")
                    .MaximumLength(50).WithMessage("Category must not exceed 50 characters");

                setting.RuleFor(s => s.Description)
                    .MaximumLength(500).WithMessage("Description must not exceed 500 characters");

                setting.RuleFor(s => s.DataType)
                    .Must(type => new[] { "string", "int", "bool", "decimal", "json", "datetime" }.Contains(type))
                    .WithMessage("DataType must be one of: string, int, bool, decimal, json, datetime");
            });
        }
    }
}