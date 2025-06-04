using AutoMapper;
using MediatR;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Domain.Common.Interfaces;
using System.Threading;
using System.Threading.Tasks;
using System.Text.Json;

namespace Planca.Application.Features.Settings.Queries.GetBusinessSettings
{
    public class GetBusinessSettingsQueryHandler : IRequestHandler<GetBusinessSettingsQuery, Result<BusinessSettingsDto>>
    {
        private readonly ISettingsRepository _settingsRepository;

        public GetBusinessSettingsQueryHandler(ISettingsRepository settingsRepository)
        {
            _settingsRepository = settingsRepository;
        }

        public async Task<Result<BusinessSettingsDto>> Handle(GetBusinessSettingsQuery request, CancellationToken cancellationToken)
        {
            var settings = await _settingsRepository.GetSettingsDictionaryAsync("Business");

            var businessSettings = new BusinessSettingsDto
            {
                BusinessName = settings.GetValueOrDefault("business_name", ""),
                BusinessDescription = settings.GetValueOrDefault("business_description", ""),
                ContactEmail = settings.GetValueOrDefault("contact_email", ""),
                ContactPhone = settings.GetValueOrDefault("contact_phone", ""),
                Website = settings.GetValueOrDefault("website", ""),
                Address = settings.GetValueOrDefault("address", ""),
                TimeZone = settings.GetValueOrDefault("timezone", "UTC"),
                Currency = settings.GetValueOrDefault("currency", "USD"),
                Language = settings.GetValueOrDefault("language", "en")
            };

            return Result<BusinessSettingsDto>.Success(businessSettings);
        }
    }
}