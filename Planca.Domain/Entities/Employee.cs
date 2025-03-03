using Planca.Domain.Common;
using Planca.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Planca.Domain.Entities
{
    public class Employee : BaseEntity
    {
        public string UserId { get; set; } // Identity relationship
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string Title { get; set; }
        public bool IsActive { get; set; }
        public List<Guid> ServiceIds { get; set; } = new List<Guid>();
        public List<WorkingHours> WorkingHours { get; set; } = new List<WorkingHours>();

        public string FullName => $"{FirstName} {LastName}";

        // Domain logic
        public bool IsAvailable(DateTime startTime, DateTime endTime)
        {
            // Convert to local time
            var day = startTime.DayOfWeek;
            var startTimeOfDay = startTime.TimeOfDay;
            var endTimeOfDay = endTime.TimeOfDay;

            // Check if the employee works on this day/time
            var workingHoursForDay = WorkingHours.Find(wh => wh.DayOfWeek == day && wh.IsWorkingDay);

            if (workingHoursForDay == null)
                return false;

            return startTimeOfDay >= workingHoursForDay.StartTime &&
                   endTimeOfDay <= workingHoursForDay.EndTime;
        }
    }
}
