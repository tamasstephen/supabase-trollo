import { PropsWithChildren, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  closestCorners,
  DragMoveEvent,
  DragStartEvent,
  UniqueIdentifier,
  DragOverlay,
} from "@dnd-kit/core";

import {
  arrayMove,
  rectSwappingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  SortingStrategy,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { BoardListCard } from "@/components";
import { BoardContainer } from "@/components/BoardContainer/BoardContainer";

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
  const [boardColumns, setBoardColumn] = useState<BoardType[]>([
    {
      id: "first",
      title: "title",
      items: [
        { id: "1", title: "hey" },
        { id: "2", title: "ho" },
      ],
    },
    {
      id: "second",
      title: "title2",
      items: [
        { id: "3", title: "hey" },
        { id: "4", title: "ho" },
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

  const findActiveContainers = (boardCardId: string) => {
    const container = boardColumns.find((column) => {
      const hasItem = column.items.find((item) => item.id === boardCardId);
      if (hasItem) {
        return column;
      }
    });
    return container;
  };

  const activeContainer = findActiveContainers(activeId as string);
  const activeCard = findActiveBoardListCard(activeId as string);

  const handleDragMove = (e: DragMoveEvent) => {
    // console.log("dragMoveEvent", e);
    const { active, over } = e;
    if (active && over && active.id && over.id && active.id !== over.id) {
      // console.log("whatever");
    }
  };

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const { id } = active;
    setActiveId(id);
    console.log(id);
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    /* console.log("event", event);
     */
    if (!over) return;

    const activeContainer = active.data.current?.sortable.containerId;
    const overContainer = over.data.current?.sortable.containerId;
    console.log("active", active);
    console.log("over", over);
    console.log("activeContainer", activeContainer);
    console.log("overContainer", overContainer);
    /* 
    if (activeContainer !== overContainer) {
      setBoardColumn((prevColumns) => {
        console.log(prevColumns);
        const activeItems = prevColumns[activeContainer];
        const overItems = prevColumns[overContainer];

        console.log("activeitems", activeItems);
        console.log("overitems", overItems);
        const activeIndex = activeItems.findIndex(
          (item) => item.id === active.id
        );
        const overIndex = overItems.findIndex((item) => item.id === over.id);

        return {
          ...prevColumns,
          [activeContainer]: activeItems.filter(
            (_, index) => index !== activeIndex
          ),
          [overContainer]: [
            ...overItems.slice(0, overIndex),
            activeItems[activeIndex],
            ...overItems.slice(overIndex),
          ],
        };
      });
    } else {
      setBoardColumn((prevColumns) => {
        console.log(prevColumns);
        const columnItems = prevColumns[activeContainer];
        const oldIndex = columnItems.findIndex((item) => item.id === active.id);
        const newIndex = columnItems.findIndex((item) => item.id === over.id);

        return {
          ...prevColumns,
          [activeContainer]: arrayMove(columnItems, oldIndex, newIndex),
        };
      });
    } */
    //setActiveId(null);
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          //onDragStart={handleDragStart}
          onDragMove={handleDragMove}
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
                  {container.items.map((i) => (
                    <BoardListCard title={i.title} id={i.id} key={i.id} />
                  ))}
                </SortableContext>
              </BoardContainer>
            ))}
          </SortableContext>
          <DragOverlay adjustScale={false}>
            {/* Drag Overlay For item Item */}
            {activeId && activeCard && (
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
