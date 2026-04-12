export interface Task{
    id: number;
    title: string;
    description: string;
    status: "todo" | "in-progress" | "done";
    order: number;
    boardId: number;
    assignedTo: string | null;
    note: string| null;
}