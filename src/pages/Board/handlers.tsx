import { BoardPrefixes } from "@/constants/constants";
import { BoardType, UpdateColumnProps } from "@/types";
import { DragEndEvent, DragStartEvent, UniqueIdentifier } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Dispatch } from "react";

export const handleDragEnd = (
  event: DragEndEvent,
  boardColumns: BoardType[],
  setBoardColumn: Dispatch<React.SetStateAction<BoardType[]>>,
  setActiveId: React.Dispatch<React.SetStateAction<UniqueIdentifier | null>>,
  updateBoardColumn: (payload: UpdateColumnProps) => void
) => {
  const { active, over } = event;

  if (!over) return;

  const activeContainer = active.data.current?.sortable.containerId;
  const overContainer = over.data.current?.sortable.containerId;
  const hoverTargetId = over.id;
  const initialItemId = active.id as string;
  if (
    (over.id as string).includes("container") &&
    (active.id as string).includes("container")
  ) {
    // Move containers
    const activeContainerIndex = boardColumns.findIndex(
      (column) => column.id === active.id
    );
    const overContainerIndex = boardColumns.findIndex(
      (column) => column.id === over.id
    );

    if (activeContainerIndex === -1 || overContainerIndex === -1) {
      return;
    }

    const currentActiveContainerId = parseInt(
      boardColumns[activeContainerIndex].id.replace(BoardPrefixes.COLUMN, "")
    );
    const currentOverContainerId = parseInt(
      boardColumns[overContainerIndex].id.replace(BoardPrefixes.COLUMN, "")
    );

    //update index of active container with the index of over container
    updateBoardColumn({
      index: overContainerIndex,
      id: currentActiveContainerId,
    });

    //update index of active container with the index of over container
    updateBoardColumn({
      index: activeContainerIndex,
      id: currentOverContainerId,
    });

    const newItems = [...boardColumns];
    const newArray = arrayMove(
      newItems,
      activeContainerIndex,
      overContainerIndex
    );

    setBoardColumn(newArray);
  }
  if (
    (over.id as string).includes("container") &&
    initialItemId.includes("card") &&
    initialItemId !== hoverTargetId
  ) {
    // If the dragged item is dropped into an empty container
    setBoardColumn((prevColumns) => {
      const activeColumn = prevColumns.find(
        (column) => column.id === activeContainer
      );
      const overColumn = prevColumns.find(
        (column) => column.id === hoverTargetId
      );
      if (!activeColumn || !overColumn) return prevColumns;
      const activeIndex = activeColumn.items.findIndex(
        (item) => item.id === active.id
      );
      const newActiveItems = activeColumn.items.filter(
        (_, index) => index !== activeIndex
      );

      const newOverItems = [activeColumn.items[activeIndex]];
      const newColumns = prevColumns.map((column) => {
        if (column.id === active?.data?.current?.sortable.containerId) {
          column.items = newActiveItems;
        }
        if (column.id === hoverTargetId) {
          column.items = newOverItems;
        }
        return column;
      });
      return newColumns;
    });
  } else if (activeContainer !== overContainer) {
    // If the grabbed item is dropped into a new container

    setBoardColumn((prevColumns) => {
      const activeColumn = prevColumns.find(
        (column) => column.id === activeContainer
      );
      const overColumn = prevColumns.find(
        (column) => column.id === overContainer
      );

      if (!activeColumn || !overColumn) return prevColumns;
      const activeItems = activeColumn.items;
      const overItems = overColumn.items;

      const activeIndex = activeItems.findIndex(
        (item) => item.id === active.id
      );
      const overIndex = overItems.findIndex((item) => item.id === over.id);
      const newActiveItems = activeItems.filter(
        (_, index) => index !== activeIndex
      );
      const newOverItems = [
        ...overItems.slice(0, overIndex),
        activeItems[activeIndex],
        ...overItems.slice(overIndex),
      ];

      const newColumns = prevColumns.map((column) => {
        if (column.id === activeContainer) {
          column.items = newActiveItems;
        }
        if (column.id === overContainer) {
          column.items = newOverItems;
        }
        return column;
      });

      return newColumns;
    });
  } else {
    // if the dragged item stays in the same container
    setBoardColumn((prevColumns) => {
      const activeColumn = prevColumns.find(
        (column) => column.id === activeContainer
      );
      if (!activeColumn) return prevColumns;
      const columnItems = activeColumn.items;
      const oldIndex = columnItems.findIndex((item) => item.id === active.id);
      const newIndex = columnItems.findIndex((item) => item.id === over.id);
      const newColumns = prevColumns.map((column) => {
        if (column.id === activeContainer) {
          column.items = arrayMove(columnItems, oldIndex, newIndex);
        }
        return column;
      });

      return newColumns;
    });
  }
  setActiveId(null);
};

export const handleDragStart = (
  event: DragStartEvent,
  setActiveId: React.Dispatch<React.SetStateAction<UniqueIdentifier | null>>
) => {
  const { active } = event;
  const { id } = active;
  setActiveId(id);
};
