'use client';

import PageLoader from '@/components/page-loader';
import { Badge } from '@/components/ui/badge';
import { fetcher } from '@/lib/fetcher';
import { ChevronLeftIcon, ChevronRightIcon, SlashIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import challengeLogo from '../../public/challenge.png';
import ErrorComp from './error';
import { useUser } from './user-provider';

interface Flight {
    number: string;
    time: string;
    users: { id: string; name: string; hebrewName: string; role: keyof typeof Roles }[];
}

interface UserAssignments {
    day: string;
    flights: Flight[];
}

const Roles = {
    RAMPAGENT: 'Ramp Agent',
    PLANNER: 'Planner',
    LOADMASTER: 'Load Master',
    TRAINEE: 'Trainee',
}

export default function UserFlights() {
    const user = useUser();
    const [currentDayIndex, setCurrentDayIndex] = useState(0);
    const [uniqueDays, setUniqueDays] = useState<string[]>([]);
    const t = useTranslations('Index');
    const isRtl = t('lang') === 'he'; // Determine if language is RTL

    // SWR hook to fetch assignments
    const { data: assignments = [], error, isLoading } = useSWR<UserAssignments[]>(
        user?.id ? `/api/assignments/${user.id}` : null,
        fetcher
    );

    // Populate uniqueDays (7 days before and after today)
    useEffect(() => {
        const today = new Date();
        const rangeDays = Array.from({ length: 14 }).map((_, i) => {
            const date = new Date(today);
            date.setDate(today.getDate() + i - 7); // Show 7 days before and 7 days after today
            return date.toISOString().split('T')[0];
        });
        setUniqueDays(rangeDays);

        // Set currentDayIndex to today's date if it exists in uniqueDays
        const todayString = today.toISOString().split('T')[0];
        const todayIndex = rangeDays.indexOf(todayString);
        setCurrentDayIndex(todayIndex !== -1 ? todayIndex : 0);
    }, []);

    const currentDayISO = uniqueDays.length > 0 ? uniqueDays[currentDayIndex] : null;
    const flights = assignments.length > 0 &&
        assignments.find((assignment) => assignment.day === currentDayISO)?.flights || [];

    // Format currentDayISO into desired format (e.g., "Sunday-24/11/2024")
    const formattedCurrentDay = currentDayISO
        ? new Intl.DateTimeFormat('en-US', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
            .format(new Date(currentDayISO))
            .replace(',', '')
            .replace(/(\w+)\s(\d{2})\/(\d{2})\/(\d{4})/, '$1 - $3/$2/$4') // Format as "day-24/11/2024"
        : null;

    const handlePrevDay = () => {
        setCurrentDayIndex((prev) => (prev === 0 ? uniqueDays.length - 1 : prev - 1));
    };

    const handleNextDay = () => {
        setCurrentDayIndex((prev) => (prev === uniqueDays.length - 1 ? 0 : prev + 1));
    };

    if (isLoading) return <PageLoader />;
    if (error)
        return (
            <ErrorComp
                error={error}
                reset={function (): void {
                    throw new Error('Function not implemented.');
                }}
            />
        );

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
                <div className="text-xl font-bold">{formattedCurrentDay}</div>
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
                            className="flex-grow flex flex-col justify-center gap-4 items-center border border-black bg-secondary text-foreground p-4 rounded-lg"
                            dir="ltr"
                        >
                            {/* Flight Info */}
                            <div className="flex flex-row justify-center gap-20 items-center">
                                <Image src={challengeLogo} width={40} alt="flight-logo" />
                                <div className="bg-secondary-foreground w-0.5 h-12 rounded-sm" />
                                <div>
                                    <div className="font-bold text-lg">{flight.number}</div>
                                    <div className="text-sm">{flight.time}</div>
                                </div>
                            </div>
                            <div className="bg-secondary-foreground w-5/6 h-0.5 rounded-sm" />
                            {/* Users Assigned to the Flight */}
                            <div className="flex flex-wrap justify-center gap-2">
                                {flight.users.map((user) => (
                                    <Badge
                                        key={user.id}
                                        dir={isRtl ? 'rtl' : 'ltr'}
                                        className={`flex flex-col text-center px-3 py-1 ${user.role === 'RAMPAGENT'
                                            ? 'bg-green-700 hover:bg-green-600'
                                            : user.role === 'PLANNER'
                                                ? 'bg-blue-700 hover:bg-blue-600'
                                                : user.role === 'LOADMASTER' ? 'bg-red-700 hover:bg-red-600' : 'bg-purple-700 hover:bg-purple-600'
                                            }`}
                                    >
                                        {isRtl ? user.hebrewName : user.name}<br /> <span className='italic font-extralight'>({Roles[user.role]})</span>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex justify-center italic"><SlashIcon /></div>
            )}
        </div>
    );
}