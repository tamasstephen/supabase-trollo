import { BoardPrefixes, TableNames } from "@/constants";
import { BoardColumnType } from "@/types";
import { DraggableBoardContainer, DraggableTask } from "@/types/Board";
import { useCallback } from "react";
import { useAuthContext } from "../useAuthContext";
import { useQuery } from "@tanstack/react-query";

export const useFetchTasksWithContainers = (
  boardId: number,
  containers: BoardColumnType[] | undefined
) => {
  const { supabaseClient } = useAuthContext();

  const fetchTasks = useCallback(async () => {
    if (!supabaseClient) {
      throw new Error("client is not available");
    }
    const containersCopy = structuredClone(
      containers
    ) as unknown as DraggableBoardContainer[];
    const result = await Promise.all(
      containersCopy.map(async (container) => {
        const { data, error } = await supabaseClient
          .from(TableNames.TASK)
          .select()
          .eq("board_id", container.id)
          .order("index", { ascending: true });
        if (error) {
          throw new Error(error.message);
        }
        container.id = `${BoardPrefixes.COLUMN}${container.id}`;
        if (data) {
          const tasks = data as unknown as DraggableTask[];
          container.items = tasks.map((task) => {
            task.id = `${BoardPrefixes.ITEM}${task.id}`;
            return task;
          });
        } else {
          container.items = [];
        }
        return container;
      })
    );
    return result.sort(
      (firstCont, secondCont) => firstCont.index - secondCont.index
    );
  }, [containers, boardId]);

  const query = useQuery({
    queryKey: [`tasks/${boardId}`],
    queryFn: () => fetchTasks(),
    enabled: !!containers,
  });

  return query;
};
