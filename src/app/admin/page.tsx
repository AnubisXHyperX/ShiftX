'use client'

import PageLoader from '@/components/page-loader'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { JobType } from '@prisma/client'
import { ArrowUpFromLineIcon, NotebookPenIcon, PlaneIcon, XIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import useSWR from 'swr'
import ErrorComp from '../error'

interface Schedule {
  [day: string]: {
    [flight: string]: string[]
  }
}

interface User {
  id: string
  name: string
  hebrewName: string
  jobType: JobType
}

const flights = [
  'Flight 1',
  'Flight 2',
  'Flight 3',
  'Flight 4',
  'Flight 5',
  'Flight 6',
  'Flight 7',
  'Flight 8',
  'Flight 9',
  'Flight 10',
  'Flight 11',
  'Flight 12',
  'Flight 13',
  'Flight 14',
  'Flight 15',
]



const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

// Helper function to group users by job type
function groupUsersByJobType(users: User[]): { [jobType: string]: User[] } {
  const groups: { [jobType: string]: User[] } = {}
  users.forEach((user) => {
    if (!groups[user.jobType]) {
      groups[user.jobType] = []
    }
    groups[user.jobType].push(user)
  })
  return groups
}

// Map job types to colors
const jobTypeColors: { [key in User['jobType']]: string } = {
  RAMPAGENT: 'bg-green-700 hover:bg-green-600',
  PLANNER: 'bg-blue-700 hover:bg-blue-600',
  LOADMASTER: 'bg-red-700 hover:bg-red-600',
}

export default function AdminPage() {
  const { data: users, error } = useSWR<User[]>('/api/users', fetcher)

  const [schedule, setSchedule] = useState<Schedule>({})

  const t = useTranslations('AdminPage')


  const days = [
    { key: 'Sunday', display: t('Sunday'), date: '19/11' },
    { key: 'Monday', display: t('Monday'), date: '20/11' },
    { key: 'Tuesday', display: t('Tuesday'), date: '21/11' },
    { key: 'Wednesday', display: t('Wednesday'), date: '22/11' },
    { key: 'Thursday', display: t('Thursday'), date: '23/11' },
    { key: 'Friday', display: t('Friday'), date: '24/11' },
    { key: 'Saturday', display: t('Saturday'), date: '25/11' },
  ]

  useEffect(() => {
    // Fetch existing assignments on component mount
    const fetchAssignments = async () => {
      try {
        const res = await fetch('/api/assignments')
        if (!res.ok) throw new Error('Failed to fetch assignments')
        const data = await res.json()
        setSchedule(data)
      } catch (error) {
        console.error('Failed to fetch assignments:', error)
      }
    }

    fetchAssignments()
  }, [])

  const assignUserToFlight = async (day: string, flight: string, userId: string) => {
    setSchedule((prev) => {
      const existingUsers = prev[day]?.[flight] || []
      if (existingUsers.includes(userId)) return prev
      return {
        ...prev,
        [day]: {
          ...(prev[day] || {}),
          [flight]: [...existingUsers, userId],
        },
      }
    })

    try {
      await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, flight, day }),
      })
    } catch (error) {
      console.error('Failed to save assignment:', error)
    }
  }

  const removeUserFromFlight = async (day: string, flight: string, userId: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...(prev[day] || {}),
        [flight]: (prev[day]?.[flight] || []).filter((id) => id !== userId),
      },
    }));

    try {
      const queryParams = new URLSearchParams({ userId, flight, day }).toString();
      await fetch(`/api/assignments?${queryParams}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to remove assignment:', error);
    }
  };

  const getCompanyColor = (flight: string) => {
    switch (flight) {
      case 'Flight 1':
      case 'Flight 2':
      case 'Flight 3':
      case 'Flight 4':
        return 'dark:bg-amber-800 bg-amber-500'
      case 'Flight 5':
      case 'Flight 6':
      case 'Flight 7':
      case 'Flight 8':
        return 'dark:bg-purple-800 bg-purple-500'
      case 'Flight 9':
      case 'Flight 10':
      case 'Flight 11':
      case 'Flight 12':
        return 'dark:bg-cyan-800 bg-cyan-500'
      case 'Flight 13':
      case 'Flight 14':
      case 'Flight 15':
        return 'dark:bg-fuchsia-800 bg-fuchsia-500'
      default:
        return 'dark:bg-gray-800 bg-gray-500'
    }
  }

  if (error) return <ErrorComp error={error} reset={function (): void {
    throw new Error('Function not implemented.')
  }} />
  if (!users) return <PageLoader />

  const groupedUsers = groupUsersByJobType(users)

  return (
    <DndProvider backend={HTML5Backend}>
      <Card className="mx-auto max-w-6xl rounded-none xs:rounded-lg">
        <CardHeader>
          <CardTitle className="text-xl">{t('title')}</CardTitle>
          <CardDescription className='flex justify-between'>
            {t('content')}
            <div className='flex gap-2' dir='rtl'>
              <Badge className='text-background bg-green-700 hover:bg-green-600'><PlaneIcon size={12} />&nbsp;Ramp Agent</Badge>
              <Badge className='text-background bg-blue-700 hover:bg-blue-600'><NotebookPenIcon size={12} />&nbsp;Planner</Badge>
              <Badge className='text-background bg-red-700 hover:bg-red-600'><ArrowUpFromLineIcon size={12} />&nbsp;Loadmaster</Badge>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <Card className="p-4 flex flex-wrap gap-2">
            {Object.entries(groupedUsers).map(([jobType, users]) => (
              <div key={jobType} className="mb-4">
                {/* <h3 className="text-lg font-bold">{jobType}</h3> */}
                <div className="flex flex-wrap gap-2">
                  {users.map((user) => (
                    <DraggableUser key={user.id} user={user} />
                  ))}
                </div>
              </div>
            ))}
          </Card>
          <Table className="rounded-lg text-background">
            <TableHeader>
              <TableRow>
                <TableHead className="border text-center bg-secondary">Flights</TableHead>
                {days.map((day) => (
                  <TableHead
                    key={day.key}
                    className={`border text-center bg-secondary ${t('lang') === 'he' ? 'text-right' : 'text-center'}`}
                  >
                    <div className="text-center">
                      <p className="font-semibold">{day.display}</p>
                      <p className="text-sm">{day.date}</p>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {flights.map((flight) => (
                <TableRow key={flight} className="border text-center">
                  <TableCell className={`border font-medium ${getCompanyColor(flight)}`}>{flight}</TableCell>
                  {days.map((day) => (
                    <DroppableCell
                      key={`${day.key}-${flight}`}
                      day={day.key}
                      flight={flight}
                      assignedUsers={schedule[day.key]?.[flight] || []}
                      assignUser={assignUserToFlight}
                      removeUser={removeUserFromFlight}
                      users={users}
                    />
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DndProvider>
  )
}

function DraggableUser({ user }: { user: User }) {
  const t = useTranslations('AdminPage')
  const isHebrew = t('lang') === 'he'

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'USER',
    item: { id: user.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  const color = jobTypeColors[user.jobType]

  return (
    <div ref={drag as unknown as React.RefObject<HTMLDivElement>} className="cursor-pointer">
      <Badge className={`${isDragging ? 'opacity-50' : 'opacity-100'} ${color} text-background`}>
        {isHebrew && user.hebrewName ? user.hebrewName : user.name}
      </Badge>
    </div>
  )
}

function DroppableBadge({
  day,
  flight,
  currentUserId,
  assignUser,
  removeUser,
  user,
}: {
  day: string
  flight: string
  currentUserId: string
  assignUser: (day: string, flight: string, userId: string) => void
  removeUser: (day: string, flight: string, userId: string) => void
  user: User
}) {
  const t = useTranslations('AdminPage')
  const isHebrew = t('lang') === 'he'

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'USER',
    drop: async (item: { id: string }) => {
      try {
        await fetch('/api/assignments', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentUserId,
            newUserId: item.id,
            day,
            flight,
          }),
        })

        await removeUser(day, flight, currentUserId)
        await assignUser(day, flight, item.id)
      } catch (error) {
        console.error('Failed to replace assignment:', error)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  const color = jobTypeColors[user.jobType]

  return (
    <div ref={drop as unknown as React.RefObject<HTMLDivElement>} className="relative flex items-center">
      <Badge className={`flex items-center gap-2 ${color} ${isOver ? 'ring-2 ring-blue-500' : ''} text-background`}>
        {isHebrew && user.hebrewName ? user.hebrewName : user.name}
        <XIcon
          className="w-4 h-4 cursor-pointer"
          onClick={async () => await removeUser(day, flight, currentUserId)}
        />
      </Badge>
    </div>
  )
}

function DroppableCell({
  day,
  flight,
  assignedUsers,
  assignUser,
  removeUser,
  users,
}: {
  day: string
  flight: string
  assignedUsers: string[]
  assignUser: (day: string, flight: string, userId: string) => void
  removeUser: (day: string, flight: string, userId: string) => void
  users: User[]
}) {
  const t = useTranslations('AdminPage')
  const isHebrew = t('lang') === 'he'

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'USER',
    drop: (item: { id: string }) => {
      assignUser(day, flight, item.id)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  return (
    <TableCell
      ref={drop as unknown as React.RefObject<HTMLTableCellElement>}
      className={`border text-center p-2 ${isOver ? 'bg-gray-100 dark:bg-background' : 'bg-white dark:bg-background'}`}
    >
      <div className="flex justify-center items-center flex-wrap gap-2 h-full">
        {assignedUsers.map((userId, index) => {
          const user = users.find((u) => u.id === userId)
          if (!user) return null

          return (
            <DroppableBadge
              key={userId + index}
              day={day}
              flight={flight}
              currentUserId={userId}
              assignUser={assignUser}
              removeUser={removeUser}
              user={user} // Pass full user object
            />
          )
        })}
      </div>
    </TableCell>
  )
}