export interface Board {
  background?: string | null;
  name: string;
  imageUrl?: string;
  id: number;
}

export interface BoardItem {
  id: string;
  title: string;
}

export type BoardType = {
  id: string;
  title: string;
  items: BoardItem[];
  index: number;
};

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

export interface Task {
  board_id: number;
  id: number;
  title: string;
  description?: string;
  index: number;
}

export type TaskPayload = Omit<Task, "id">;
