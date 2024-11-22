'use client'

import PageLoader from '@/components/page-loader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { fetcher } from '@/lib/fetcher'
import { JobType } from '@prisma/client'
import { addDays, format, startOfWeek } from 'date-fns'
import { ArrowUpFromLineIcon, ChevronLeftIcon, ChevronRightIcon, NotebookPenIcon, PlaneIcon, UserRoundPlusIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import useSWR from 'swr'
import ErrorComp from '../error'
import NotFound from '../not-found'
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
  'X7-752',
  'X7-753',
  'X7-754',
  'X7-755',
  '5C-123',
  '5C-124',
  '5C-125',
  '5C-126',
  '5C-127',
  '5C-128',
  'X6-252',
  'X6-253',
  'X6-254',
  'X6-255',
]

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

export default function AdminPage() {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const { data: users, error } = useSWR<User[]>('/api/users', fetcher)

  const today = format(new Date(), 'yyyy-MM-dd'); // Get today's date formatted as 'yyyy-MM-dd'
  const [schedule, setSchedule] = useState<Schedule>({})

  const t = useTranslations('AdminPage')
  const isRtl = t('lang') === 'he'; // Check if the language is RTL

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 }); // Week starts on Sunday
  const days = Array.from({ length: 7 }).map((_, index) => {
    const date = addDays(weekStart, index);
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

  const user = useUser()
  if (!user) {
    return <NotFound />;
  }

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
          date, // This ensures the correct date is used
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
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
    const activeDays = Array.from({ length: 7 }).map((_, index) => {
      const date = addDays(weekStart, index);
      return {
        key: format(date, 'EEEE'),
        fullDate: format(date, 'yyyy-MM-dd'),
      };
    });
    const dayInfo = activeDays.find((d) => d.key === dayOrDate || d.fullDate === dayOrDate);
    const fullDate = dayInfo?.fullDate || dayOrDate;

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
    if (flight.startsWith('X7')) {
      return 'dark:bg-amber-800 bg-amber-700';
    } else if (flight.startsWith('X6')) {
      return 'dark:bg-purple-800 bg-purple-700';
    } else if (flight.startsWith('5C')) {
      return 'dark:bg-cyan-800 bg-blue-700';
    }
  };


  if (error) return <ErrorComp error={error} reset={function (): void {
    throw new Error('Function not implemented.')
  }} />
  if (!users) return <PageLoader />

  const groupedUsers = groupUsersByJobType(users)

  return (
    <DndProvider backend={HTML5Backend}>
      <Card className="mx-auto max-w-7xl rounded-none xs:rounded-lg">
        <CardHeader>
          <CardTitle className="text-xl">{t('title')}</CardTitle>
          <CardDescription className="flex justify-between flex-col gap-4">
            {t('content')}
            <div className="flex justify-center gap-2" dir="rtl">
              <Badge className="text-background bg-purple-700 hover:bg-purple-700">
                <UserRoundPlusIcon size={12} />
                &nbsp;&nbsp;Trainee
              </Badge>
              <Badge className="text-background bg-green-700 hover:bg-green-700">
                <PlaneIcon size={12} />
                &nbsp;&nbsp;Ramp Agent
              </Badge>
              <Badge className="text-background bg-blue-700 hover:bg-blue-700">
                <NotebookPenIcon size={12} />
                &nbsp;&nbsp;Planner
              </Badge>
              <Badge className="text-background bg-red-700 hover:bg-red-700">
                <ArrowUpFromLineIcon size={12} />
                &nbsp;&nbsp;Loadmaster
              </Badge>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <Card className="p-4 flex flex-wrap gap-2">
            {Object.entries(groupedUsers).map(([jobType, users]) => (
              <div key={jobType}>
                <div className="flex flex-wrap gap-2">
                  {users.map((user) => (
                    <DraggableUser key={user.id} user={user} />
                  ))}
                </div>
              </div>
            ))}
          </Card>
          <div className="flex items-center justify-between py-4" dir={isRtl ? 'rtl' : 'ltr'}>
            <Button
              onClick={handlePrevWeek}
              className="bg-secondary hover:bg-gray-200 text-xl font-bold text-gray-700"
              size={'icon'}
            >
              {isRtl ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </Button>
            <div className="text-xl font-bold">
              {t('Week of')} {format(weekStart, 'dd/MM/yyyy')}
            </div>
            <Button
              onClick={handleNextWeek}
              className="bg-secondary hover:bg-gray-200 text-xl font-bold text-gray-700"
              size={'icon'}
            >
              {isRtl ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </Button>
          </div>
          <Table className="text-white">
            <TableHeader>
              <TableRow>
                <TableHead className="border text-center bg-secondary text-foreground">
                  Flights
                </TableHead>
                {days.map((day) => (
                  <TableHead
                    key={day.key}
                    className={`border text-center text-foreground bg-secondary ${day.fullDate === today ? 'bg-yellow-200 dark:bg-opacity-50 ' : ''
                      } ${isRtl ? 'text-right' : 'text-center'}`}
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
                  <TableCell
                    className={`border font-medium ${getCompanyColor(flight)} whitespace-nowrap`}
                  >
                    {flight}
                  </TableCell>
                  {days.map((day) => (
                    <DroppableCell
                      key={`${day.fullDate}-${flight}`}
                      fullDate={day.fullDate}
                      flight={flight}
                      assignedUsers={schedule[day.fullDate]?.[flight] || []}
                      assignUser={assignUserToFlight}
                      removeUser={removeUserFromFlight}
                      users={users}
                      className={
                        day.fullDate === today ? 'bg-yellow-200 dark:bg-opacity-50' : ''
                      }
                    />
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DndProvider>
  );
}