using System;
using System.Text.Json.Serialization;

namespace Planca.Application.DTOs
{
    public class WorkDayScheduleDto
    {
        public int Day { get; set; } // Represents DayOfWeek as int (0 = Sunday, 1 = Monday, etc.)

        // Store the actual time values as strings for serialization
        private string _openTimeString = "09:00";
        private string _closeTimeString = "17:00";

        [JsonIgnore]
        public TimeSpan OpenTime => string.IsNullOrEmpty(_openTimeString) ?
            TimeSpan.Parse("09:00") : TimeSpan.Parse(_openTimeString);

        [JsonIgnore]
        public TimeSpan CloseTime => string.IsNullOrEmpty(_closeTimeString) ?
            TimeSpan.Parse("17:00") : TimeSpan.Parse(_closeTimeString);

        // String properties for serialization/deserialization
        public string OpenTimeString
        {
            get => _openTimeString;
            set => _openTimeString = value;
        }

        public string CloseTimeString
        {
            get => _closeTimeString;
            set => _closeTimeString = value;
        }
    }
}