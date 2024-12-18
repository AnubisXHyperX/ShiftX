import { XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useDrop } from "react-dnd";
import { mutate } from "swr";
import { jobTypeColors } from "./DraggableUser";
import { User } from "./page";

export function DroppableBadge({
    date,
    flight,
    currentUserId,
    assignUser,
    removeUser,
    user,
}: {
    date: string;
    flight: string;
    currentUserId: string;
    assignUser: (date: string, flight: string, userId: string) => void;
    removeUser: (day: string, flight: string, userId: string) => void;
    user: User;
}) {
    const t = useTranslations("AdminPage");
    const isHebrew = t("lang") === "he";

    const [{ isOver }, drop] = useDrop(() => ({
        accept: "USER",
        drop: async (item: { id: string }) => {
            // Optimistic Update
            removeUser(date, flight, currentUserId);
            assignUser(date, flight, item.id);

            try {
                // Update the backend
                await fetch("/api/assignments", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        currentUserId,
                        newUserId: item.id,
                        date,
                        flight,
                    }),
                });

                // Revalidate SWR cache
                mutate(`/api/assignments?date=${date}&flight=${flight}`);
            } catch (error) {
                console.error("Failed to replace assignment:", error);

                // Revert optimistic update on failure
                assignUser(date, flight, currentUserId);
                removeUser(date, flight, item.id);
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));

    const handleRemoveUser = async () => {
        // Optimistic Update
        removeUser(date, flight, currentUserId);

        try {
            await fetch(`/api/assignments?userId=${currentUserId}&date=${date}&flight=${flight}`, {
                method: "DELETE",
            });

            // Revalidate SWR cache
            mutate(`/api/assignments?date=${date}&flight=${flight}`);
        } catch (error) {
            console.error("Failed to remove user:", error);

            // Revert optimistic update on failure
            assignUser(date, flight, currentUserId);
        }
    };

    const color = jobTypeColors[user.jobType];

    return (
        <div
            ref={drop as unknown as React.RefObject<HTMLDivElement>}
            className="relative flex items-center"
        >
            <div
                className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded-full font-medium text-xs md:text-xs ${color} ${isOver ? "ring-2 ring-blue-500" : ""}`}
            >
                <span className="truncate">
                    {isHebrew && user.hebrewName ? user.hebrewName : user.name || "Unknown User"}
                </span>
                <XIcon
                    className="w-4 h-4 cursor-pointer"
                    onClick={() => {
                        console.log("Removing user:", { date, flight, currentUserId });
                        handleRemoveUser();
                    }}
                />
            </div>
        </div>
    );
}