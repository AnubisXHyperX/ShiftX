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
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import useSWR from 'swr';
import NotFound from '../not-found';
import { useUser } from '../user-provider';

const SHIFTS = ['morning', 'noon', 'night'] as const;

export default function BlocksPage() {
    const t = useTranslations('BlocksPage');
    const isRtl = t('lang') === 'he'; // Determine if language is RTL
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

    const { data: savedBlocks, isLoading, mutate } = useSWR(
        `/api/blocks?weekStart=${weekStart.toISOString().split('T')[0]}`,
        fetcher,
        {
            onSuccess: (data) => {
                console.log('Fetched Blocks:', data);
            },
        }
    );

    const shiftLabels = SHIFTS.map((shift) => t(shift)); // Translated shift labels

    const toggleBlock = (date: string, hour?: string) => {
        setBlocks((prev) => {
            const updatedBlocks = { ...prev };

            if (hour) {
                updatedBlocks[date] = {
                    ...savedBlocks?.[date],
                    ...updatedBlocks[date],
                    [hour]: !(updatedBlocks[date]?.[hour] ?? savedBlocks?.[date]?.[hour] ?? false),
                };
            } else {
                const isDayBlocked = SHIFTS.every(
                    (h) => updatedBlocks[date]?.[h] ?? savedBlocks?.[date]?.[h] ?? false
                );

                updatedBlocks[date] = {};
                SHIFTS.forEach((h) => {
                    updatedBlocks[date][h] = !isDayBlocked;
                });
            }

            return updatedBlocks;
        });
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);

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
                body: JSON.stringify(mergedBlocks),
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('Failed to save blocks:', error);
            } else {
                mutate();
            }
        } catch (error) {
            console.error('Error saving blocks:', error);
        }
        setIsSaving(false);
    };

    const user = useUser();
    if (!user) {
        return <NotFound />;
    }

    const handlePrevWeek = () => {
        setCurrentWeek((prev) => addDays(prev, isRtl ? 7 : -7));
    };

    const handleNextWeek = () => {
        setCurrentWeek((prev) => addDays(prev, isRtl ? -7 : 7));
    };

    return (
        <Card className="mx-auto max-w-6xl rounded-none xs:rounded-lg">
            <CardHeader>
                <CardTitle className="text-xl">{t('title')}</CardTitle>
                <CardDescription className="flex justify-between items-center gap-4">
                    {t('description')}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
                <div className="flex justify-between items-center" dir={isRtl ? 'rtl' : 'ltr'}>
                    <Button
                        className="bg-secondary hover:bg-gray-200 text-xl font-bold text-gray-700"
                        size="icon"
                        onClick={handlePrevWeek}
                    >
                        {isRtl ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    </Button>
                    <h2 className="text-xl font-bold">
                        {t('weekOf')} {format(weekStart, 'dd/MM/yyyy')}
                    </h2>
                    <Button
                        className="bg-secondary hover:bg-gray-200 text-xl font-bold text-gray-700"
                        size="icon"
                        onClick={handleNextWeek}
                    >
                        {isRtl ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                    </Button>
                </div>

                {!isLoading ? (
                    <div>
                        <Table className="border text-background">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="border text-center bg-secondary">{t('shifts')}</TableHead>
                                    {days.map((day) => (
                                        <TableHead
                                            key={day.key}
                                            className="border text-center bg-secondary cursor-pointer"
                                            onClick={() => toggleBlock(day.fullDate)}
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
                                {SHIFTS.map((hour, index) => (
                                    <TableRow key={hour} className="border text-center">
                                        <TableCell className="border text-gray-500 bg-secondary font-medium h-12">
                                            {shiftLabels[index]}
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
                                {isSaving ? <ButtonLoader isLoading /> : t('saveBlocks')}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <PageLoader />
                )}
            </CardContent>
        </Card>
    );
}