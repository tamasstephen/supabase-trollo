import { Dispatch, SetStateAction, useCallback, useEffect } from "react";
import { DraggableBoardContainer } from "@/types";
import { BoardPrefixes, TableNames } from "@/constants/constants";
import { BoardColumnType, DraggableTask, Task } from "@/types/Board";
import { useFetch } from "./useFetch";

export const useFetchBoardColumns = (
  boardId: number,
  setBoardColumns: Dispatch<SetStateAction<DraggableBoardContainer[]>>
) => {
  const { error, loading, fetchData } = useFetch();

  const fetchTasks = useCallback(
    async (id: number) => {
      const data = await fetchData<Task>(TableNames.TASK, true, {
        filterBy: "board_id",
        value: id,
      });
      return data;
    },
    [fetchData]
  );

  const fetchBoardColumns = useCallback(async () => {
    const columns = await fetchData<BoardColumnType>(TableNames.COLUMN, true, {
      filterBy: "board_id",
      value: boardId,
    });
    if (!columns) return;
    for (const column of columns) {
      const columnTasks = await fetchTasks(column.id);
      if (columnTasks) {
        const tasks = columnTasks as unknown as DraggableTask[];
        column.items = tasks.map((task) => {
          task.id = `${BoardPrefixes.ITEM}${task.id}`;
          return task;
        });
      } else {
        column.items = [];
      }
    }
    const draggableColumns = columns as unknown as DraggableBoardContainer[];
    const idPrefixedColumns = draggableColumns
      .map((column) => {
        column.id = `${BoardPrefixes.COLUMN}${column.id}`;
        return column;
      })
      .sort((a, b) => a.index - b.index);
    setBoardColumns(idPrefixedColumns);
  }, [fetchData, boardId, setBoardColumns, fetchTasks]);

  useEffect(() => {
    fetchBoardColumns();
  }, [fetchBoardColumns]);

  return { error, loading };
};
