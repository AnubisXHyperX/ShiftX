'use client'

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import swissLogo from '../../public/swiss.png'

interface Flight {
    number: string
    time: string
}

interface DaySchedule {
    departures: Flight[]
    arrivals: Flight[]
}

const schedule: Record<string, DaySchedule> = {
    Sunday: {
        departures: [
            { number: 'X7-252', time: '08:00' },
            { number: 'X6-731', time: '10:00' },
            { number: '5C-851', time: '12:00' },
        ],
        arrivals: [
            { number: 'X6-753', time: '09:00' },
            { number: '5C-253', time: '11:00' },
            { number: '5C-852', time: '13:00' },
        ],
    },
    Monday: {
        departures: [
            { number: 'X6-262', time: '07:30' },
            { number: '5C-741', time: '09:30' },
        ],
        arrivals: [
            { number: 'X7-763', time: '08:30' },
            { number: 'X7-263', time: '10:30' },
        ],
    },
}

const days = Object.keys(schedule)

export default function UserFlights() {
    const [currentDayIndex, setCurrentDayIndex] = useState(0)
    const [currentDate, setCurrentDate] = useState<string | null>(null)

    const currentDay = days[currentDayIndex]
    const { departures, arrivals } = schedule[currentDay]

    useEffect(() => {
        // Ensure the date is only rendered on the client
        setCurrentDate(new Date().toLocaleDateString())
    }, [])

    const handlePrevDay = () => {
        setCurrentDayIndex((prev) => (prev === 0 ? days.length - 1 : prev - 1))
    }

    const handleNextDay = () => {
        setCurrentDayIndex((prev) => (prev === days.length - 1 ? 0 : prev + 1))
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
                    {currentDay} - {currentDate || 'Loading...'}
                </div>
                <button
                    onClick={handleNextDay}
                    className="text-xl font-bold text-gray-700"
                >
                    <ChevronRightIcon />
                </button>
            </div>

            {/* Grid for departures and arrivals with a divider */}
            <div className="grid grid-cols-1 gap-6 h-auto" dir='rtl'>
                {/* Departures Column */}
                <div className="flex flex-col gap-4">
                    {departures.map((flight) => (
                        <div
                            key={flight.number}
                            className="flex-grow flex flex-row justify-center gap-20 items-center border border-green-600 bg-secondary text-foreground p-4 rounded-lg"
                            dir='ltr'
                        >
                            <Image src={swissLogo} width={65} alt='swiss' />
                            <div className="bg-secondary-foreground w-0.5 h-12 rounded-sm" />
                            <div>
                                <div className="font-bold text-lg">{flight.number}</div>
                                <div className="text-sm">{flight.time}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Divider */}
                {/* <div className="bg-secondary-foreground w-0.5 h-auto rounded-sm" />

                <div className="flex flex-col gap-4">
                    {arrivals.map((flight) => (
                        <div
                            key={flight.number}
                            className="flex-grow flex flex-row justify-center gap-6 items-center border border-red-600 bg-secondary text-foreground p-4 rounded-lg"
                            dir='ltr'
                        >
                            <Image src={challengeLogo} width={30} alt='challenge' />
                            <div className="bg-secondary-foreground w-0.5 h-12 rounded-sm" />
                            <div>
                                <div className="font-bold text-lg">{flight.number}</div>
                                <div className="text-sm">{flight.time}</div>
                            </div>
                        </div>
                    ))}
                </div> */}
            </div>
        </div>
    )
}