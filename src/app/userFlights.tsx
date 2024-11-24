'use client'

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import challengeLogo from '../../public/challenge.png'
import { useUser } from './user-provider'

interface Flight {
    number: string
    time: string
}

interface UserAssignments {
    day: string
    flights: Flight[]
}

export default function UserFlights() {
    const user = useUser()
    const [currentDayIndex, setCurrentDayIndex] = useState(0)
    const [currentDate, setCurrentDate] = useState<string | null>(null)
    const [assignments, setAssignments] = useState<UserAssignments[]>([])
    const [uniqueDays, setUniqueDays] = useState<string[]>([])

    const currentDayISO = uniqueDays.length > 0 ? uniqueDays[currentDayIndex] : null
    const flights =
        assignments.find((assignment) => assignment.day === currentDayISO)?.flights || []

    // Format currentDayISO into desired format (e.g., "Sunday-24/11/2024")
    const formattedCurrentDay = currentDayISO
        ? new Intl.DateTimeFormat('en-US', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
            .format(new Date(currentDayISO))
            .replace(',', '')
            .replace(/(\w+)\s(\d{2})\/(\d{2})\/(\d{4})/, '$1 - $3/$2/$4') // Format as "day-24/11/2024"
        : null

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                if (!user?.id) {
                    return
                }

                const res = await fetch(`/api/assignments/${user.id}`)
                if (!res.ok) throw new Error('Failed to fetch assignments')

                const data: UserAssignments[] = await res.json()
                setAssignments(data)

                // Populate uniqueDays with all dates to display (e.g., week range)
                const today = new Date()
                const rangeDays = Array.from({ length: 14 }).map((_, i) => {
                    const date = new Date(today)
                    date.setDate(today.getDate() + i - 7) // Show 7 days before and 7 days after today
                    return date.toISOString().split('T')[0]
                })

                setUniqueDays(rangeDays)

                // Set currentDayIndex to today's date if it exists in uniqueDays
                const todayString = today.toISOString().split('T')[0]
                const todayIndex = rangeDays.indexOf(todayString)
                setCurrentDayIndex(todayIndex !== -1 ? todayIndex : 0) // Fallback to the first day if today is not in rangeDays
            } catch (error) {
            }
        }

        setCurrentDate(new Date().toLocaleDateString())
        fetchAssignments()
    }, [user?.id])

    const handlePrevDay = () => {
        setCurrentDayIndex((prev) => (prev === 0 ? uniqueDays.length - 1 : prev - 1))
    }

    const handleNextDay = () => {
        setCurrentDayIndex((prev) => (prev === uniqueDays.length - 1 ? 0 : prev + 1))
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-secondary-foreground w-auto h-0.5 rounded-sm" />
            {/* Header with arrows and day */}
            <div className="flex items-center justify-between" dir="ltr">
                <button
                    onClick={handlePrevDay}
                    className="text-xl font-bold text-gray-700"
                >
                    <ChevronLeftIcon />
                </button>
                <div className="text-xl font-bold">
                    {formattedCurrentDay}
                </div>
                <button
                    onClick={handleNextDay}
                    className="text-xl font-bold text-gray-700"
                >
                    <ChevronRightIcon />
                </button>
            </div>

            {/* Flights List */}
            {currentDayISO && flights.length > 0 ? (
                <div className="flex flex-col gap-4">
                    {flights.map((flight) => (
                        <div
                            key={flight.number}
                            className="flex-grow flex flex-row justify-center gap-20 items-center border border-blue-600 bg-secondary text-foreground p-4 rounded-lg"
                            dir="ltr"
                        >
                            <Image src={challengeLogo} width={40} alt="swiss" />
                            <div className="bg-secondary-foreground w-0.5 h-12 rounded-sm" />
                            <div>
                                <div className="font-bold text-lg">
                                    {flight.number}
                                </div>
                                <div className="text-sm">{flight.time}</div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className='flex justify-center italic'>
                    No flights Assigned.
                </div>
            )}
        </div>
    )
}