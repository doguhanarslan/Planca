using System;
using System.Collections.Generic;

namespace Planca.Application.DTOs
{
    public class EmployeeDto
    {
        public Guid Id { get; set; }
        public string UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string Title { get; set; }
        public bool IsActive { get; set; }
        public List<Guid> ServiceIds { get; set; }
        public List<WorkingHoursDto> WorkingHours { get; set; }
    }

    public class WorkingHoursDto
    {
        public DayOfWeek DayOfWeek { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public bool IsWorkingDay { get; set; }
    }
}