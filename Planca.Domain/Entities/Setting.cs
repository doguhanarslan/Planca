using Planca.Domain.Common;
using System;

namespace Planca.Domain.Entities
{
    /// <summary>
    /// Tenant-specific application settings
    /// </summary>
    public class Setting : BaseEntity
    {
        /// <summary>
        /// Setting key identifier
        /// </summary>
        public string Key { get; set; } = string.Empty;

        /// <summary>
        /// Setting value as JSON string for flexibility
        /// </summary>
        public string Value { get; set; } = string.Empty;

        /// <summary>
        /// Setting category for grouping (e.g., "Business", "Notification", "Booking")
        /// </summary>
        public string Category { get; set; } = string.Empty;

        /// <summary>
        /// Human-readable description
        /// </summary>
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// Data type of the value (string, int, bool, decimal, json)
        /// </summary>
        public string DataType { get; set; } = "string";

        /// <summary>
        /// Whether this setting is active
        /// </summary>
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Whether this is a system setting (not user-editable)
        /// </summary>
        public bool IsSystemSetting { get; set; } = false;

        /// <summary>
        /// Display order for UI
        /// </summary>
        public int DisplayOrder { get; set; } = 0;
    }
}