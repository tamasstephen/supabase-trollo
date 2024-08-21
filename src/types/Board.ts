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
