import { TableCell } from "@/components/ui/table";
import { useDrop } from "react-dnd";
import { DroppableBadge } from "./DroppableBadge";
import { User } from "./page";

export function DroppableCell({
    day,
    flight,
    assignedUsers,
    assignUser,
    removeUser,
    users,
    days,
}: {
    day: string;
    flight: string;
    assignedUsers: string[];
    assignUser: (date: string, flight: string, userId: string) => void;
    removeUser: (date: string, flight: string, userId: string) => void;
    users: User[];
    days: { key: string; display: string; fullDate: string }[];
}) {
    const dayInfo = days.find((d) => d.key === day || d.fullDate === day);
    const fullDate = dayInfo?.fullDate || '';
    const displayDate = dayInfo?.display || '';

    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'USER',
        drop: (item: { id: string }) => {
            assignUser(fullDate, flight, item.id);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));

    return (
        <TableCell
            ref={drop as unknown as React.RefObject<HTMLTableCellElement>}
            className={`border text-center p-2 ${isOver ? 'bg-gray-100 dark:bg-background' : 'bg-white dark:bg-background'}`}
        >
            <div className="flex justify-center items-center flex-wrap gap-2 h-full">
                {assignedUsers.map((userId, index) => {
                    const user = users.find((u) => u.id === userId);
                    if (!user) return null;

                    return (
                        <DroppableBadge
                            key={userId + index}
                            date={fullDate}
                            flight={flight}
                            currentUserId={userId}
                            assignUser={assignUser}
                            removeUser={(date, flight, userId) => {
                                console.log('DroppableCell: Removing user:', { date, flight, userId });
                                removeUser(date, flight, userId);
                            }}
                            user={user}
                        />
                    );
                })}
            </div>
        </TableCell>
    );
}