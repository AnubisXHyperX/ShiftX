import { TableCell } from "@/components/ui/table";
import { format } from "date-fns";
import { useDrop } from "react-dnd";
import { DroppableBadge } from "./DroppableBadge";
import { User } from "./page";

export function DroppableCell({
    fullDate,
    flight,
    assignedUsers,
    assignUser,
    removeUser,
    users,
    className,
}: {
    fullDate: string;
    flight: string;
    assignedUsers: string[];
    assignUser: (date: string, flight: string, userId: string) => void;
    removeUser: (date: string, flight: string, userId: string) => void;
    users: User[];
    className: string;
}) {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: "USER",
        drop: (item: { id: string }) => {
            assignUser(fullDate, flight, item.id);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));

    // Get today's date in the same format as fullDate
    const today = format(new Date(), "yyyy-MM-dd");

    // Determine the base class for the cell
    const baseClass = fullDate === today ? "bg-yellow-100" : "";

    // Include the hover class if an item is dragged over
    const hoverClass = isOver ? "bg-gray-100 dark:bg-background" : "";

    return (
        <TableCell
            ref={drop as unknown as React.RefObject<HTMLTableCellElement>}
            className={`${className} border text-center p-2 ${baseClass} ${hoverClass}`}
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
                            removeUser={removeUser}
                            user={user}
                        />
                    );
                })}
            </div>
        </TableCell>
    );
}