export interface DbObject {
  id: number;
  title: string;
}

export interface Board extends DbObject {
  background?: string | null;
  imageUrl?: string;
}

export interface BoardColumnType extends DbObject {
  items: Task[];
  index: number;
}

export interface UpdateColumnProps {
  index?: number;
  title?: string;
  id: number;
}

export interface BoardColumnPayload {
  title: string;
  index: number;
  board_id: number;
}

export type BoardPayload = Omit<Board, "image" | "id">;

export interface Task extends DbObject {
  board_id: number;
  description?: string;
  index: number;
}

export type TaskPayload = Omit<Task, "id">;

type DraggableId = { id: string };

export type DraggableBoardContainer = Omit<BoardColumnType, "id" | "items"> &
  DraggableId & { items: DraggableTask[] };
export type DraggableTask = Omit<Task, "id" | "board_id" | "index"> &
  DraggableId;
