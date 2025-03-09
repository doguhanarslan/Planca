using System.Text.Json.Serialization;

public class WorkDayScheduleDto
{
    public int Day { get; set; } // Changed from DayOfWeek to int

    private TimeSpan _openTime;
    private TimeSpan _closeTime;

    [JsonIgnore] // Hide the actual TimeSpan property from serialization
    public TimeSpan OpenTime
    {
        get => _openTime;
        set => _openTime = value;
    }

    [JsonIgnore] // Hide the actual TimeSpan property from serialization
    public TimeSpan CloseTime
    {
        get => _closeTime;
        set => _closeTime = value;
    }

    // String properties for serialization/deserialization
    public string OpenTimeString
    {
        get => _openTime.ToString(@"hh\:mm");
        set => _openTime = TimeSpan.Parse(value);
    }

    public string CloseTimeString
    {
        get => _closeTime.ToString(@"hh\:mm");
        set => _closeTime = TimeSpan.Parse(value);
    }
}