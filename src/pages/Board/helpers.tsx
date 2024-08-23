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

export const findActiveBoardListCard = (
  id: string,
  boardColumns: DraggableBoardContainer[]
) => {
  const card = boardColumns
    .find((board) => board.items.find((item) => item.id === id))
    ?.items.find((item) => id === item.id);

  return card;
};

export const findActiveContainers = (
  activeId: string,
  boardColumns: DraggableBoardContainer[]
) => {
  const container = boardColumns.find((column) => column.id === activeId);

  return container;
};

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
