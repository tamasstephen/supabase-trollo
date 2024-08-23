import { BoardPrefixes, TableNames } from "@/constants/constants";
import {
  DraggableBoardContainer,
  UpdateColumnProps,
  UpdateTaskProps,
} from "@/types";

export const sanitizeDraggableId = (
  containerId: string,
  prefix?: BoardPrefixes
) => parseInt(containerId.replace(prefix ? prefix : BoardPrefixes.COLUMN, ""));

export const updateContainerTasks = (
  column: DraggableBoardContainer,
  updateItem: (
    payload: UpdateColumnProps | UpdateTaskProps,
    tableName: TableNames
  ) => void
) => {
  for (const idx in column.items) {
    const realId = sanitizeDraggableId(
      column.items[idx].id,
      BoardPrefixes.ITEM
    );
    const containerId = sanitizeDraggableId(column.id, BoardPrefixes.COLUMN);
    updateItem(
      { id: realId, index: parseInt(idx), board_id: containerId },
      TableNames.TASK
    );
  }
};
