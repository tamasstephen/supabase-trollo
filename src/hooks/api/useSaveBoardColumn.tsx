import { BoardColumnPayload, BoardType } from "@/types";
import { useSave } from "./useSave";

export const useSaveBoardColumn = () => {
  const { error, loading, saveToDb } = useSave<Omit<BoardType, "items">>();

  const saveBoardColumn = (payload: BoardColumnPayload) => {
    const response = saveToDb(payload, "board_column");
    return response;
  };

  return { loading, error, saveBoardColumn };
};
