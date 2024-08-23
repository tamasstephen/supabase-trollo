import { useDelete } from "./useDelete";
import { TableNames } from "@/constants/constants";

export const useDeleteBoardColumn = () => {
  const { deleteItem, error, loading } = useDelete();

  const deleteBoardColumn = async (
    boardId: number,
    tasks: number[] | undefined
  ) => {
    if (tasks) {
      for (const taskId of tasks) {
        await deleteItem(taskId, TableNames.TASK);
      }
    }
    await deleteItem(boardId, TableNames.COLUMN);
  };

  return { error, loading, deleteBoardColumn };
};
