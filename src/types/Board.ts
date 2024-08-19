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
};
