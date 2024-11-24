import { XIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useDrop } from "react-dnd"
import { jobTypeColors, User } from "./page"

export function DroppableBadge({
    date,
    flight,
    currentUserId,
    assignUser,
    removeUser,
    user,
}: {
    date: string
    flight: string
    currentUserId: string
    assignUser: (date: string, flight: string, userId: string) => void
    removeUser: (day: string, flight: string, userId: string) => void
    user: User
}) {
    const t = useTranslations('AdminPage');
    const isHebrew = t('lang') === 'he';

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
                        date,
                        flight,
                    }),
                });

                removeUser(date, flight, currentUserId);
                assignUser(date, flight, item.id);
            } catch (error) {
                console.error('Failed to replace assignment:', error);
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));

    const color = jobTypeColors[user.jobType];

    return (
        <div
            ref={drop as unknown as React.RefObject<HTMLDivElement>}
            className="relative flex items-center"
        >
            <div
                className={`flex items-center gap-2 px-2 py-0.5 rounded-full font-bold text-xs ${color} ${isOver ? 'ring-2 ring-blue-500' : ''
                    }`}
            >
                {isHebrew && user.hebrewName ? user.hebrewName : user.name || 'Unknown User'}
                <XIcon
                    className="w-4 h-4 cursor-pointer"
                    onClick={() => {
                        console.log('Removing user:', { date, flight, currentUserId });
                        removeUser(date, flight, currentUserId);
                    }}
                />
            </div>
        </div>
    );
}