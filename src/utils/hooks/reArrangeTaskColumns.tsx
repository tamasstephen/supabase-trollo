import { DraggableBoardContainer, SaveQueryProps, Task } from "@/types";
import { MutableRefObject } from "react";
import { sanitizeDraggableId } from "../sanitizeDraggableId";
import { BoardPrefixes } from "@/constants";

export const reArrangeTaskColumns = (
  oldData: DraggableBoardContainer[],
  taskId: MutableRefObject<number>,
  variables: SaveQueryProps
) => {
  if (taskId.current === -1) throw new Error("Invalid item ID");
  const containersCopy = structuredClone(oldData) as DraggableBoardContainer[];
  const taskPayload = variables.payload as Task;
  const updatedContainers = containersCopy.map((container) => {
    if (taskPayload.board_id === sanitizeDraggableId(container.id)) {
      const newTaskId = `${BoardPrefixes.ITEM}${taskId.current}`;
      const newTask = { ...taskPayload, id: newTaskId };
      container.items.push(newTask);
    }
    return container;
  });
  taskId.current = -1;
  return updatedContainers;
};
