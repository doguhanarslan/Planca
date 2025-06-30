using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Planca.Domain.Common.Enums
{
    public enum AppointmentStatus
    {
        /// <summary>
        /// Randevu talebi oluşturuldu, işletme onayı bekleniyor (Guest appointments için)
        /// </summary>
        Pending = 0,

        /// <summary>
        /// Randevu zamanlandı (Registered customer appointments için varsayılan)
        /// </summary>
        Scheduled = 1,

        /// <summary>
        /// Randevu onaylandı
        /// </summary>
        Confirmed = 2,

        /// <summary>
        /// Randevu devam ediyor
        /// </summary>
        InProgress = 3,

        /// <summary>
        /// Randevu tamamlandı
        /// </summary>
        Completed = 4,

        /// <summary>
        /// Randevu iptal edildi
        /// </summary>
        Canceled = 5,

        /// <summary>
        /// Müşteri gelmedi
        /// </summary>
        NoShow = 6,

        /// <summary>
        /// Randevu talebi reddedildi (Guest appointments için)
        /// </summary>
        Rejected = 7
    }
}