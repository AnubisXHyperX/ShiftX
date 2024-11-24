import { useTranslations } from "next-intl";
import { useDrag } from "react-dnd";
import { jobTypeColors, User } from "./page";

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