'use client';

import ButtonLoader from '@/components/button-loader';
import PageLoader from '@/components/page-loader';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { fetcher } from '@/lib/fetcher';
import { addDays, format, startOfWeek } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useState } from 'react';
import useSWR from 'swr';
import NotFound from '../not-found';
import { useUser } from '../user-provider';

export default function BlocksPage() {
    const user = useUser();
    if (!user) {
        return <NotFound />;
    }
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [blocks, setBlocks] = useState<{ [date: string]: { [hour: string]: boolean } }>({});
    const [isSaving, setIsSaving] = useState(false);

    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 }); // Week starts on Sunday
    const days = Array.from({ length: 7 }).map((_, index) => {
        const date = addDays(weekStart, index);
        return {
            key: format(date, 'EEEE'), // Day name (e.g., Sunday)
            display: format(date, 'dd/MM'), // Formatted date for display
            fullDate: format(date, 'yyyy-MM-dd'), // ISO date
        };
    });

    const hours = Array.from({ length: 24 }, (_, i) => `${i}`); // 24-hour blocks as strings for consistency

    // Fetch saved blocks using SWR
    const { data: savedBlocks, isLoading, mutate } = useSWR(
        `/api/blocks?weekStart=${weekStart.toISOString().split('T')[0]}`,
        fetcher,
        {
            onSuccess: (data) => {
                console.log('Fetched Blocks:', data); // Debug fetched blocks
            },
        }
    );

    const toggleBlock = (date: string, hour?: string) => {
        setBlocks((prev) => {
            const updatedBlocks = { ...prev };

            if (hour) {
                // Toggle a specific hour
                updatedBlocks[date] = {
                    ...savedBlocks?.[date], // Preserve previously saved state
                    ...updatedBlocks[date], // Preserve already toggled state
                    [hour]: !(updatedBlocks[date]?.[hour] ?? savedBlocks?.[date]?.[hour] ?? false),
                };
            } else {
                // Toggle the whole day
                const isDayBlocked = hours.every(
                    (h) => updatedBlocks[date]?.[h] ?? savedBlocks?.[date]?.[h] ?? false
                );

                updatedBlocks[date] = {};
                hours.forEach((h) => {
                    updatedBlocks[date][h] = !isDayBlocked; // Block or unblock the entire day
                });
            }

            return updatedBlocks;
        });
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);

            // Merge savedBlocks and blocks to ensure the state is consistent
            const mergedBlocks = { ...savedBlocks };
            Object.entries(blocks).forEach(([date, hours]) => {
                if (!mergedBlocks[date]) {
                    mergedBlocks[date] = {};
                }
                Object.entries(hours).forEach(([hour, value]) => {
                    mergedBlocks[date][hour] = value;
                });
            });

            const response = await fetch('/api/blocks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mergedBlocks), // Send the merged state
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('Failed to save blocks:', error);
            } else {
                mutate(); // Revalidate SWR after saving
            }
        } catch (error) {
            console.error('Error saving blocks:', error);
        }
        setIsSaving(false);
    };

    return (
        <Card className="mx-auto max-w-6xl rounded-none xs:rounded-lg">
            <CardHeader>
                <CardTitle className="text-xl">Schedule Your Blocks</CardTitle>
                <CardDescription className="flex justify-between items-center gap-4">
                    Use the table below to select or release your preferred blocks for the week.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
                {/* Week Navigation */}
                <div className="flex justify-between items-center">
                    <Button
                        className="bg-secondary hover:bg-gray-200 text-xl font-bold text-gray-700"
                        size="icon"
                        onClick={() => setCurrentWeek((prev) => addDays(prev, -7))}
                    >
                        <ChevronLeftIcon />
                    </Button>
                    <h2 className="text-xl font-bold">
                        Week of {format(weekStart, 'dd/MM/yyyy')}
                    </h2>
                    <Button
                        className="bg-secondary hover:bg-gray-200 text-xl font-bold text-gray-700"
                        size="icon"
                        onClick={() => setCurrentWeek((prev) => addDays(prev, 7))}
                    >
                        <ChevronRightIcon />
                    </Button>
                </div>

                {/* Table */}
                {!isLoading ?
                    <div>
                        <Table className="border rounded-lg text-background">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="border text-center bg-secondary">Times</TableHead>
                                    {days.map((day) => (
                                        <TableHead
                                            key={day.key}
                                            className="border text-center bg-secondary cursor-pointer"
                                            onClick={() => toggleBlock(day.fullDate)} // Toggle the whole day
                                        >
                                            <div className="text-center flex flex-col">
                                                <span className="font-semibold">{day.display}</span>
                                                <span className="text-sm">{day.key}</span>
                                            </div>
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody className="border">
                                {hours.map((hour) => (
                                    <TableRow key={hour} className="border text-center">
                                        <TableCell className="border text-gray-500 bg-secondary font-medium">
                                            {hour}:00
                                        </TableCell>
                                        {days.map((day) => {
                                            const isBlocked =
                                                blocks[day.fullDate]?.[hour] ??
                                                savedBlocks?.[day.fullDate]?.[hour] ??
                                                false;

                                            return (
                                                <TableCell
                                                    key={`${day.fullDate}-${hour}`}
                                                    className={`border cursor-pointer ${isBlocked ? 'bg-red-500 text-white' : ''
                                                        }`}
                                                    onClick={() => toggleBlock(day.fullDate, hour)}
                                                />
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>


                        <div className="mt-4 text-center">
                            <Button
                                onClick={handleSave}
                                size={isSaving ? 'icon' : 'sm'}
                                disabled={isSaving}
                                className={`bg-primary hover:bg-primary/90 ${isSaving ? 'cursor-not-allowed' : ''
                                    }`}
                            >
                                {isSaving ? <ButtonLoader isLoading /> : 'Save Blocks'}
                            </Button>
                        </div>
                    </div>
                    : <PageLoader />
                }

            </CardContent>
        </Card>
    );
}