export interface Task{
    id: number;
    title: string;
    status: "to-do" | "in-progress" | "done";
    order: number;
    boardId: number;
}