import { Avatar, AvatarFallback, AvatarImage } from "@ebox/ui/avatar"

export function RecentActivity() {
  return (
    <div className="space-y-8">
      {recentActivities.map((activity, index) => (
        <div className="flex items-center" key={index}>
          <Avatar className="h-9 w-9">
            <AvatarImage src={activity.avatar} alt="Avatar" />
            <AvatarFallback>{activity.initials}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{activity.name}</p>
            <p className="text-sm text-muted-foreground">{activity.action}</p>
          </div>
          <div className="ml-auto font-medium">{activity.time}</div>
        </div>
      ))}
    </div>
  )
}

const recentActivities = [
  {
    name: "John Smith",
    action: "Delivered 12 parcels at Location A",
    time: "2h ago",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "JS",
  },
  {
    name: "Sarah Johnson",
    action: "Added new locker at Location C",
    time: "4h ago",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "SJ",
  },
  {
    name: "Michael Brown",
    action: "Maintenance completed at Location B",
    time: "Yesterday",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "MB",
  },
  {
    name: "Emily Davis",
    action: "Updated capacity at Location D",
    time: "2d ago",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "ED",
  },
  {
    name: "Robert Wilson",
    action: "Resolved issue at Location E",
    time: "5d ago",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "RW",
  },
]

