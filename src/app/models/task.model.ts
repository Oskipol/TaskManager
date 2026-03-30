export interface Task{
    id: number;
    title: string;
    description: string;
    status: "to-do" | "in-progress" | "done";
    order: number;
    boardId: number;
    assignedTo: string | null;
}