import clsx from 'clsx'
import { PropsWithChildren } from 'react'

interface NotificationBadgeProps {
  count: number
  hidden?: boolean
}

function NotificationBadge(props: PropsWithChildren<NotificationBadgeProps>) {
  return (
    <div className="relative">
      {props.children}
      <div
        className={clsx(
          'absolute top-0 left-0 bg-red-500 px-1 min-w-4 h-4 rounded-full text-[10px] font-semibold text-white items-center justify-center',
          props.hidden ? 'hidden' : 'flex'
        )}
      >
        {props.count > 0 && props.count}
      </div>
    </div>
  )
}

export default NotificationBadge
