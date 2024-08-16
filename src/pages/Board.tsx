import { useState, MouseEvent } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  closestCorners,
  DragStartEvent,
  UniqueIdentifier,
  DragOverlay,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import { BoardListCard, Portal } from "@/components";
import { BoardContainer } from "@/components";
import { AddBoardColumn } from "@/components";
import { BoardColumnFormElement } from "@/types";

interface BoardItem {
  id: string;
  title: string;
}

type BoardType = {
  id: string;
  title: string;
  items: BoardItem[];
};

export const Board = () => {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [boardColumns, setBoardColumn] = useState<BoardType[]>([
    {
      id: "first-container",
      title: "title",
      items: [
        { id: "1-card", title: "hey" },
        { id: "2-card", title: "ho" },
      ],
    },
    {
      id: "second-container",
      title: "title2",
      items: [
        { id: "3-card", title: "hey" },
        { id: "4-card", title: "ho" },
      ],
    },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findActiveBoardListCard = (id: string) => {
    const card = boardColumns
      .find((board) => board.items.find((item) => item.id === id))
      ?.items.find((item) => id === item.id);

    return card;
  };

  const findActiveContainers = (activeId: string) => {
    const container = boardColumns.find((column) => column.id === activeId);

    return container;
  };

  const activeContainer = findActiveContainers(activeId as string);
  const activeCard = findActiveBoardListCard(activeId as string);

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const { id } = active;
    setActiveId(id);
  }

  const addBoardColumn = (e: React.FormEvent<BoardColumnFormElement>) => {
    e.preventDefault();
    const boardTitle = e.currentTarget.elements.boardColumnTitle.value;
    const isAlreadyPresent = boardColumns.find(
      (column) => column.title === boardTitle
    );
    if (isAlreadyPresent) {
      // TODO: implement error case
      return;
    }

    setBoardColumn([
      ...boardColumns,
      {
        id: `${boardTitle}-container`,
        title: boardTitle,
        items: [],
      },
    ]);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeContainer = active.data.current?.sortable.containerId;
    const overContainer = over.data.current?.sortable.containerId;
    const hoverTargetId = over.id;
    const initialItemId = active.id as string;
    if (
      (over.id as string).includes("container") &&
      initialItemId.includes("card") &&
      initialItemId !== hoverTargetId
    ) {
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

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <button onClick={() => setIsModalOpen(true)}>open modal</button>
        {isModalOpen && (
          <Portal closeModal={() => setIsModalOpen(false)}>
            <AddBoardColumn callback={addBoardColumn} />
          </Portal>
        )}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
        >
          <SortableContext items={boardColumns.map((i) => i.id)}>
            {boardColumns.map((container) => (
              <BoardContainer
                id={container.id}
                title={container.title}
                key={container.id}
                onAddItem={() => {}}
                description=""
              >
                <SortableContext
                  id={container.id}
                  items={container.items.map((i) => i.id)}
                >
                  <div style={{ minHeight: "100px", minWidth: "100%" }}>
                    {container.items.map((i) => (
                      <BoardListCard title={i.title} id={i.id} key={i.id} />
                    ))}
                  </div>
                </SortableContext>
              </BoardContainer>
            ))}
          </SortableContext>
          <DragOverlay adjustScale={false}>
            {/* Drag Overlay For item Item */}
            {activeId && activeId.toString().includes("card") && (
              <BoardListCard id={activeId} title={activeCard?.title || ""} />
            )}
            {/* Drag Overlay For Container */}
            {activeId && activeId.toString().includes("container") && (
              <BoardContainer
                id={activeId}
                title={activeContainer?.title || ""}
                onAddItem={() => {}}
              >
                {activeContainer?.items.map((i) => (
                  <BoardListCard key={i.id} title={i.title} id={i.id} />
                ))}
              </BoardContainer>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};
