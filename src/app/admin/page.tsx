'use client'

import PageLoader from '@/components/page-loader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { JobType } from '@prisma/client'
import { addDays, format, startOfWeek } from 'date-fns'
import { ArrowUpFromLineIcon, ChevronLeftIcon, ChevronRightIcon, NotebookPenIcon, PlaneIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import useSWR from 'swr'
import ErrorComp from '../error'
import { useUser } from '../user-provider'
import { DraggableUser } from './DraggableUser'
import { DroppableCell } from './DroppableCell'


export interface Schedule {
  [day: string]: {
    [flight: string]: string[]
  }
}

export interface User {
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
export const jobTypeColors: { [key in User['jobType']]: string } = {
  RAMPAGENT: 'bg-green-700 hover:bg-green-600',
  PLANNER: 'bg-blue-700 hover:bg-blue-600',
  LOADMASTER: 'bg-red-700 hover:bg-red-600',
}

export default function AdminPage() {
  const user = useUser()
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const { data: users, error } = useSWR<User[]>('/api/users', fetcher)

  const [schedule, setSchedule] = useState<Schedule>({})

  const t = useTranslations('AdminPage')

  const startOfCurrentWeek = startOfWeek(currentWeek, { weekStartsOn: 0 }) // Week starts on Sunday
  const days = Array.from({ length: 7 }).map((_, index) => {
    const date = addDays(startOfCurrentWeek, index);
    return {
      key: format(date, 'EEEE'), // Day name (e.g., Sunday)
      display: format(date, 'dd/MM'), // Formatted date for display (e.g., 19/11)
      fullDate: format(date, 'yyyy-MM-dd'), // Full ISO date for backend (e.g., 2024-11-24)
    };
  });

  const handlePrevWeek = () => {
    setCurrentWeek((prev) => addDays(prev, -7))
  }

  const handleNextWeek = () => {
    setCurrentWeek((prev) => addDays(prev, 7))
  }

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

  const assignUserToFlight = async (date: string, flight: string, userId: string) => {
    if (!date || !flight || !userId) {
      console.error('Invalid assign parameters:', { date, flight, userId });
      return;
    }

    setSchedule((prev) => {
      const existingUsers = prev[date]?.[flight] || [];
      if (existingUsers.includes(userId)) return prev;
      return {
        ...prev,
        [date]: {
          ...(prev[date] || {}),
          [flight]: [...existingUsers, userId],
        },
      };
    });

    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          flight,
          date,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Backend error:', error);
      }
    } catch (error) {
      console.error('Failed to save assignment:', error);
    }
  };

  const removeUserFromFlight = async (dayOrDate: string, flight: string, userId: string) => {
    const dayInfo = days.find((d) => d.key === dayOrDate || d.fullDate === dayOrDate);
    const fullDate = dayInfo?.fullDate || dayOrDate; // Fallback to dayOrDate if already full date

    if (!fullDate) {
      console.error('Date not found for the given day:', dayOrDate);
      return;
    }

    // Optimistically update the UI
    setSchedule((prev) => ({
      ...prev,
      [fullDate]: {
        ...(prev[fullDate] || {}),
        [flight]: (prev[fullDate]?.[flight] || []).filter((id) => id !== userId),
      },
    }));

    try {
      const queryParams = new URLSearchParams({
        userId,
        flight,
        date: fullDate,
      }).toString();

      const response = await fetch(`/api/assignments?${queryParams}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to remove assignment from backend:', error);
      } else {
        console.log('User removed successfully');
      }
    } catch (error) {
      console.error('Error removing user from flight:', error);
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
          <div className="flex items-center justify-between py-4" dir='ltr'>
            <Button onClick={handlePrevWeek} className="bg-secondary hover:bg-gray-200 text-xl font-bold text-gray-700" size={'icon'}>
              <ChevronLeftIcon />
            </Button>
            <div className="text-xl font-bold">
              {t('Week of')} {format(startOfCurrentWeek, 'dd/MM/yyyy')}
            </div>
            <Button onClick={handleNextWeek} className="bg-secondary hover:bg-gray-200 text-xl font-bold text-gray-700" size={'icon'}>
              <ChevronRightIcon />
            </Button>
          </div>
          <Table className="rounded-lg text-background">
            <TableHeader>
              <TableRow>
                <TableHead className="border text-center bg-secondary">Flights</TableHead>
                {days.map((day) => (
                  <TableHead
                    key={day.key}
                    className={`border text-center bg-secondary ${t('lang') === 'he' ? 'text-right' : 'text-center'}`}
                  >
                    <div className="text-center flex flex-col">
                      <span className="font-semibold">{day.display}</span>
                      <span className="text-sm">{day.key}</span>
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
                      assignedUsers={schedule[day.fullDate]?.[flight] || []} // Use full date
                      assignUser={assignUserToFlight}
                      removeUser={removeUserFromFlight}
                      users={users}
                      days={days}
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