using AutoMapper;
using MediatR;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Domain.Common.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Features.Settings.Queries.GetSettings
{
    public class GetSettingsQueryHandler : IRequestHandler<GetSettingsQuery, Result<List<SettingsCategoryDto>>>
    {
        private readonly ISettingsRepository _settingsRepository;
        private readonly IMapper _mapper;

        public GetSettingsQueryHandler(
            ISettingsRepository settingsRepository,
            IMapper mapper)
        {
            _settingsRepository = settingsRepository;
            _mapper = mapper;
        }

        public async Task<Result<List<SettingsCategoryDto>>> Handle(GetSettingsQuery request, CancellationToken cancellationToken)
        {
            IEnumerable<Domain.Entities.Setting> settings;

            if (!string.IsNullOrEmpty(request.Category))
            {
                settings = await _settingsRepository.GetByCategoryAsync(request.Category);
            }
            else
            {
                settings = await _settingsRepository.GetActiveSettingsAsync();
            }

            // Apply filters
            if (!request.IncludeInactive)
            {
                settings = settings.Where(s => s.IsActive);
            }

            if (!request.IncludeSystemSettings)
            {
                settings = settings.Where(s => !s.IsSystemSetting);
            }

            // Group by category
            var groupedSettings = settings
                .GroupBy(s => s.Category)
                .Select(g => new SettingsCategoryDto
                {
                    Category = g.Key,
                    Settings = _mapper.Map<List<SettingDto>>(g.OrderBy(s => s.DisplayOrder).ToList())
                })
                .OrderBy(sc => sc.Category)
                .ToList();

            return Result<List<SettingsCategoryDto>>.Success(groupedSettings);
        }
    }
}