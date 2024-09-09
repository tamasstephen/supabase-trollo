import { BoardPrefixes, TableNames } from "@/constants/constants";
import { DraggableBoardContainer, UpdateBoardItemsArgs } from "@/types";
import { sanitizeDraggableId } from "@/utils";

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
  updateItem: ({ payload, tableName }: UpdateBoardItemsArgs) => void
) => {
  for (const idx in column.items) {
    const realId = sanitizeDraggableId(
      column.items[idx].id,
      BoardPrefixes.ITEM
    );
    const containerId = sanitizeDraggableId(column.id, BoardPrefixes.COLUMN);
    updateItem({
      payload: { id: realId, index: parseInt(idx), board_id: containerId },
      tableName: TableNames.TASK,
    });
  }
};
