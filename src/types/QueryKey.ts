export type TrolloQueryKey =
  | "board"
  | `board/${number}`
  | "tasks"
  | `tasks/${number}`
  | "board_columns"
  | `board_columns/${number}`
  | "boardCovers";
