import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../types/task";

const PRIORITY_COLOR: Record<Task["priority"], string> = {
  HIGH: "#DC2626",
  MEDIUM: "#D97706",
  LOW: "#9CA3AF",
};

function SortableTaskCard({ task, onClick }: { task: Task, onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-canvas border border-line rounded flex overflow-hidden cursor-grab active:cursor-grabbing"
    >
      <div
        className="w-1 shrink-0"
        style={{ backgroundColor: PRIORITY_COLOR[task.priority] }}
      />
      <div className="p-3">
        <p className="font-medium text-sm">{task.title}</p>
        {task.labels.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {task.labels.map((tl) => (
              <span
                key={tl.id}
                className="text-xs px-1.5 py-0.5 rounded"
                style={{ backgroundColor: tl.label.color + "1A", color: tl.label.color }}
              >
                {tl.label.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SortableTaskCard;