import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import api from "../api/axios";
import type { Task } from "../types/task";
import Modal from "../components/Modal";
import DroppableColumn from "../components/DroppableColumn";
import SortableTaskCard from "../components/SortableTaskCard";
import TaskDetailModal from "./../components/TaskDetailModal";

const COLUMNS = [
  { key: "TODO", label: "To Do", dot: "#9CA3AF" },
  { key: "IN_PROGRESS", label: "In Progress", dot: "#0F766E" },
  { key: "DONE", label: "Done", dot: "#16A34A" },
] as const;

function TaskBoard() {
  const { organizationId, projectId } = useParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("MEDIUM");

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const fetchTasks = async () => {
    const res = await api.get(
      `/organizations/${organizationId}/projects/${projectId}/tasks`,
    );
    setTasks(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, [organizationId, projectId]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post(
      `/organizations/${organizationId}/projects/${projectId}/tasks`,
      { title, description: description || undefined, priority },
    );
    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    setShowForm(false);
    fetchTasks();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    const isOverColumn = COLUMNS.some((c) => c.key === over.id);

    let newStatus: Task["status"];
    let newPosition: number;

    if (isOverColumn) {
      newStatus = over.id as Task["status"];
      newPosition = tasks.filter(
        (t) => t.status === newStatus && t.id !== activeTask.id,
      ).length;
    } else {
      const overTask = tasks.find((t) => t.id === over.id);
      if (!overTask) return;
      newStatus = overTask.status;
      newPosition = overTask.position;
    }

    if (
      newStatus === activeTask.status &&
      newPosition === activeTask.position
    ) {
      return;
    }

    await api.patch(
      `/organizations/${organizationId}/projects/${projectId}/tasks/${activeTask.id}/move`,
      { status: newStatus, position: newPosition },
    );

    fetchTasks();
  };

  if (loading) return <div className="p-6 text-muted">Loading…</div>;

  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-6xl mx-auto px-6 pt-4">
        <Link
          to={`/organizations/${organizationId}/projects`}
          className="text-sm text-muted hover:text-ink"
        >
          ← Projects
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 bg-accent text-white text-sm px-3 py-2 rounded"
        >
          + New task
        </button>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 overflow-x-auto">
            {COLUMNS.map((col) => {
              const colTasks = tasks
                .filter((t) => t.status === col.key)
                .sort((a, b) => a.position - b.position);

              return (
                <div key={col.key} className="w-80 shrink-0">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: col.dot }}
                    />
                    <h2 className="font-semibold">{col.label}</h2>
                    <span className="text-sm text-muted">
                      {colTasks.length}
                    </span>
                  </div>

                  <DroppableColumn
                    id={col.key}
                    taskIds={colTasks.map((t) => t.id)}
                  >
                    {colTasks.length === 0 && (
                      <p className="text-sm text-muted text-center py-8">
                        No tasks
                      </p>
                    )}
                    {colTasks.map((task) => (
                      <SortableTaskCard
                        key={task.id}
                        task={task}
                        onClick={() => setSelectedTask(task)}
                      />
                    ))}
                  </DroppableColumn>
                </div>
              );
            })}
          </div>
        </DndContext>
      </div>

      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <h2 className="font-semibold mb-4">New task</h2>
          <form onSubmit={handleAddTask} className="flex flex-col gap-3">
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="border border-line rounded px-2 py-1.5 text-sm"
              required
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="border border-line rounded px-2 py-1.5 text-sm"
              rows={3}
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Task["priority"])}
              className="border border-line rounded px-2 py-1.5 text-sm"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
            <button
              type="submit"
              className="bg-accent text-white text-sm py-2 rounded"
            >
              Create task
            </button>
          </form>
        </Modal>
      )}
      {selectedTask && (
        <TaskDetailModal
          task={tasks.find((t) => t.id === selectedTask.id) ?? selectedTask}
          organizationId={organizationId as string}
          projectId={projectId as string}
          onClose={() => setSelectedTask(null)}
          onChanged={fetchTasks}
        />
      )}
    </div>
  );
}

export default TaskBoard;
