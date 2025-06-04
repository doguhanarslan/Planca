using AutoMapper;
using MediatR;
using Planca.Application.Common.Interfaces;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Domain.Common.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Features.Settings.Commands.UpdateSettings
{
    public class UpdateSettingsCommandHandler : IRequestHandler<UpdateSettingsCommand, Result<List<SettingDto>>>
    {
        private readonly ISettingsRepository _settingsRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUserService;

        public UpdateSettingsCommandHandler(
            ISettingsRepository settingsRepository,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ICurrentUserService currentUserService)
        {
            _settingsRepository = settingsRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _currentUserService = currentUserService;
        }

        public async Task<Result<List<SettingDto>>> Handle(UpdateSettingsCommand request, CancellationToken cancellationToken)
        {
            var updatedSettings = new List<Domain.Entities.Setting>();

            foreach (var settingItem in request.Settings)
            {
                // Check if setting exists
                var existingSetting = await _settingsRepository.GetByKeyAsync(settingItem.Key);

                if (existingSetting != null)
                {
                    // Update existing setting
                    if (existingSetting.IsSystemSetting)
                    {
                        return Result<List<SettingDto>>.Failure($"Cannot modify system setting: {settingItem.Key}");
                    }

                    existingSetting.Value = settingItem.Value;
                    existingSetting.Category = settingItem.Category;
                    existingSetting.Description = settingItem.Description;
                    existingSetting.DataType = settingItem.DataType;
                    existingSetting.IsActive = settingItem.IsActive;
                    existingSetting.DisplayOrder = settingItem.DisplayOrder;
                    existingSetting.LastModifiedBy = _currentUserService.UserId ?? "System";
                    existingSetting.LastModifiedAt = DateTime.UtcNow;

                    await _settingsRepository.UpdateAsync(existingSetting);
                    updatedSettings.Add(existingSetting);
                }
                else
                {
                    // Create new setting
                    var newSetting = new Domain.Entities.Setting
                    {
                        Key = settingItem.Key,
                        Value = settingItem.Value,
                        Category = settingItem.Category,
                        Description = settingItem.Description,
                        DataType = settingItem.DataType,
                        IsActive = settingItem.IsActive,
                        DisplayOrder = settingItem.DisplayOrder,
                        IsSystemSetting = false,
                        TenantId = request.TenantId,
                        CreatedBy = _currentUserService.UserId ?? "System",
                        CreatedAt = DateTime.UtcNow
                    };

                    await _settingsRepository.AddAsync(newSetting);
                    updatedSettings.Add(newSetting);
                }
            }

            // Save changes
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // Map to DTOs
            var settingDtos = _mapper.Map<List<SettingDto>>(updatedSettings);

            return Result<List<SettingDto>>.Success(settingDtos);
        }
    }
}