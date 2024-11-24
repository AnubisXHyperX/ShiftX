import { TableCell } from "@/components/ui/table";
import { useDrop } from "react-dnd";
import { DroppableBadge } from "./DroppableBadge";
import { User } from "./page";

export function DroppableCell({
    fullDate, // Receive fullDate directly
    flight,
    assignedUsers,
    assignUser,
    removeUser,
    users,
}: {
    fullDate: string; // Use fullDate explicitly
    flight: string;
    assignedUsers: string[];
    assignUser: (date: string, flight: string, userId: string) => void;
    removeUser: (date: string, flight: string, userId: string) => void;
    users: User[];
}) {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: "USER",
        drop: (item: { id: string }) => {
            assignUser(fullDate, flight, item.id); // Use the passed fullDate
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));

    return (
        <TableCell
            ref={drop as unknown as React.RefObject<HTMLTableCellElement>}
            className={`border text-center p-2 ${isOver ? "bg-gray-100 dark:bg-background" : "bg-white dark:bg-background"
                }`}
        >
            <div className="flex justify-center items-center flex-wrap gap-2 h-full">
                {assignedUsers.map((userId, index) => {
                    const user = users.find((u) => u.id === userId);
                    if (!user) return null;

                    return (
                        <DroppableBadge
                            key={userId + index}
                            date={fullDate} // Pass the correct fullDate here
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