export interface TaskAssignee {
  id: string;
  userId: string;
  user: {
    id: string;
    email: string;
  };
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface TaskLabel {
  id: string;
  labelId: string;
  label: Label;
}

export interface Task {
    id:string;
    title: string;
    description: string | null;
    status: "TODO" | "IN_PROGRESS" | "DONE";
    priority: "LOW" | "MEDIUM" | "HIGH";
    position: number;
    projectId: string;
    assignees: TaskAssignee[];
    labels: TaskLabel[];

}
