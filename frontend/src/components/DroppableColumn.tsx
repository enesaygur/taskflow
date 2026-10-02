import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { ReactNode } from "react";

function DroppableColumn({
  id,
  taskIds,
  children,
}: {
  id: string;
  taskIds: string[];
  children: ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
      <div
        ref={setNodeRef}
        className="bg-column rounded-lg p-2 flex flex-col gap-2 min-h-112"
      >
        {children}
      </div>
    </SortableContext>
  );
}

export default DroppableColumn;
