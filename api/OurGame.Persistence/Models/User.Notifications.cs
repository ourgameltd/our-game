using System.Collections.Generic;

namespace OurGame.Persistence.Models;

public partial class User
{
    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    public virtual ICollection<NotificationRead> NotificationReads { get; set; } = new List<NotificationRead>();
}
