import { useEffect, useState } from "react";
import type { Task } from "../types/task";
import type { Member } from "../types/member";
import api from "../api/axios";
import Modal from "./Modal";

interface ProjectLabel {
  id: string;
  name: string;
  color: string;
}
function TaskDetailModal({
  task,
  organizationId,
  projectId,
  onClose,
  onChanged,
}: {
  task: Task;
  organizationId: string;
  projectId: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState(task.priority);
  const [members, setMembers] = useState<Member[]>([]);
  const [labels, setLabels] = useState<ProjectLabel[]>([]);

  const base = `/organizations/${organizationId}/projects/${projectId}`;

  useEffect(() => {
    api.get(`/organizations/${organizationId}/members`).then((res) => setMembers(res.data));
    api.get(`${base}/labels`).then((res) => setLabels(res.data));
  }, [organizationId, projectId]);

  const handleSave = async () => {
    await api.put(`${base}/tasks/${task.id}`, { description, priority });
    onChanged();
  };

  const assignedIds = task.assignees.map((a) => a.userId);

  const toggleAssignee = async (userId: string) => {
    if (assignedIds.includes(userId)) {
      await api.delete(`${base}/tasks/${task.id}/assignees/${userId}`);
    } else {
      await api.post(`${base}/tasks/${task.id}/assignees`, { userId });
    }
    onChanged();
  };

  const taskLabelIds = task.labels.map((tl) => tl.labelId);

  const toggleLabel = async (labelId: string) => {
    if (taskLabelIds.includes(labelId)) {
      await api.delete(`${base}/tasks/${task.id}/labels/${labelId}`);
    } else {
      await api.post(`${base}/tasks/${task.id}/label`, { labelId });
    }
    onChanged();
  };

  const handleArchived = async () => {
    await api.delete(`${base}/tasks/${task.id}`);
    onChanged();
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="font-semibold mb-4">{task.title}</h2>

      <label className="text-sm text-muted">Description</label>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onBlur={handleSave}
        rows={3}
        className="border border-line rounded px-2 py-1.5 text-sm w-full mt-1 mb-3"
      />

      <label className="text-sm text-muted">Priority</label>
      <select
        value={priority}
        onChange={(e) => {
          setPriority(e.target.value as Task["priority"]);
        }}
        onBlur={handleSave}
        className="border border-line rounded px-2 py-1.5 text-sm w-full mt-1 mb-3"
      >
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
      </select>

      <label className="text-sm text-muted">Assignees</label>
      <div className="flex flex-wrap gap-1 mt-1 mb-3">
        {members.map((m) => {
          const active = assignedIds.includes(m.userId);
          return (
            <button
              key={m.id}
              onClick={() => toggleAssignee(m.userId)}
              className={`text-xs px-2 py-1 rounded border ${
                active
                  ? "bg-accent text-white border-accent"
                  : "border-line text-muted"
              }`}
            >
              {m.user.email}
            </button>
          );
        })}
      </div>

      <label className="text-sm text-muted">Labels</label>
      <div className="flex flex-wrap gap-1 mt-1 mb-4">
        {labels.map((l) => {
          const active = taskLabelIds.includes(l.id);
          return (
            <button
              key={l.id}
              onClick={() => toggleLabel(l.id)}
              className="text-xs px-2 py-1 rounded border"
              style={{
                borderColor: l.color,
                backgroundColor: active ? l.color : "transparent",
                color: active ? "#fff" : l.color,
              }}
            >
              {l.name}
            </button>
          );
        })}
      </div>

      <button
        onClick={handleArchived}
        className="text-sm text-red-600 hover:underline"
      >
        Archive Task
      </button>
    </Modal>
  );
}

export default TaskDetailModal;
