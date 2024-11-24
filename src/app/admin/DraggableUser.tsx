import { useTranslations } from "next-intl";
import { useDrag } from "react-dnd";
import { User } from "./page";

export const jobTypeColors: { [key in User['jobType']]: string } = {
    RAMPAGENT: 'bg-green-700 hover:bg-green-600',
    PLANNER: 'bg-blue-700 hover:bg-blue-600',
    LOADMASTER: 'bg-red-700 hover:bg-red-600',
}

export function DraggableUser({ user }: { user: User }) {
    const t = useTranslations("AdminPage");
    const isHebrew = t("lang") === "he";

    const [{ isDragging }, drag] = useDrag(() => ({
        type: "USER",
        item: { id: user.id },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    const color = jobTypeColors[user.jobType]; // Background color based on job type

    return (
        <div
            ref={drag as unknown as React.RefObject<HTMLDivElement>}
            className={`cursor-pointer px-2 py-1 rounded-full text-xs font-bold flex items-center gap-2 ${isDragging ? "opacity-50" : "opacity-100"
                } ${color} text-background`}
        >
            {isHebrew && user.hebrewName ? user.hebrewName : user.name || "Unknown User"}
        </div>
    );
}