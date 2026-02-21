'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import {
  Bell,
  CheckCircle2,
  Info,
  MessageSquareText,
  AlertTriangle,
  XCircle,
  ArrowRight,
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { SiteNotification } from '@/data/mockNotifications'
import { cn } from '@/lib/utils'

interface NotificationListProps {
  notifications: SiteNotification[]
  onClose?: () => void
  userRole: 'student' | 'admin'
}

const getIcon = (type: SiteNotification['type']) => {
  switch (type) {
    case 'success':
      return <CheckCircle2 className="size-4 text-success" />
    case 'warning':
      return <AlertTriangle className="size-4 text-warning" />
    case 'error':
      return <XCircle className="size-4 text-destructive" />
    case 'info':
      return <Info className="size-4 text-primary" />
    case 'message':
      return <MessageSquareText className="size-4 text-muted-foreground" />
  }
}

export function NotificationList({ notifications, onClose }: NotificationListProps) {
  const [visibleCount, setVisibleCount] = useState(5)
  const unreadCount = notifications.filter((n) => !n.isRead).length
  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
  const visibleNotifications = sortedNotifications.slice(0, visibleCount)

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 5)
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center justify-between px-4 py-3 pr-12 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="font-semibold text-sm shrink-0">การแจ้งเตือน</h3>
          {unreadCount > 0 && (
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors h-5 px-1.5 text-[10px] shrink-0"
            >
              {unreadCount} ใหม่
            </Badge>
          )}
        </div>
        <button className="text-xs text-primary hover:underline font-medium shrink-0">
          อ่านทั้งหมด
        </button>
      </div>

      <ScrollArea className="flex-1 overflow-y-auto">
        {visibleNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <Bell className="size-8 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">ไม่มีการแจ้งเตือน</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              คุณจะได้รับการแจ้งเตือนความเคลื่อนไหวที่นี่
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {visibleNotifications.map((notif) => {
              const NotificationElement = notif.link ? Link : 'div'

              return (
                <NotificationElement
                  key={notif.id}
                  href={notif.link || '#'}
                  onClick={() => {
                    if (notif.link && onClose) onClose()
                  }}
                  className={cn(
                    'flex items-start gap-4 p-4 hover:bg-muted/40 transition-colors relative w-full text-left',
                    !notif.isRead && 'bg-primary/[0.02]',
                  )}
                >
                  {!notif.isRead && (
                    <div className="absolute top-1/2 -translate-y-1/2 left-1.5 size-1.5 rounded-full bg-primary" />
                  )}

                  <div className="shrink-0 mt-0.5 p-2 rounded-full bg-background border border-border shadow-sm">
                    {getIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <p
                        className={cn(
                          'text-sm font-medium truncate',
                          !notif.isRead ? 'text-foreground' : 'text-muted-foreground',
                        )}
                      >
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                        {format(new Date(notif.createdAt), 'HH:mm', { locale: th })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </NotificationElement>
              )
            })}
          </div>
        )}
      </ScrollArea>

      {/* Footer Link if applicable (Like See All) */}
      {visibleCount < sortedNotifications.length && (
        <div className="p-2 border-t border-border/50 shrink-0">
          <button
            onClick={handleLoadMore}
            className="flex items-center justify-center w-full py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted cursor-pointer"
          >
            โหลดการแจ้งเตือนเพิ่มเติม <ArrowRight className="size-3 ml-1.5" />
          </button>
        </div>
      )}
    </div>
  )
}
