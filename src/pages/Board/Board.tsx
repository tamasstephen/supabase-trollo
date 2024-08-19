import { useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  UniqueIdentifier,
  DragOverlay,
} from "@dnd-kit/core";

import {
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { handleDragEnd, handleDragStart } from "./handlers";
import { AddBoardItem, BoardListCard, Portal } from "@/components";
import { BoardContainer } from "@/components";
import { AddBoardColumn } from "@/components";
import { BoardColumnFormElement, BoardType } from "@/types";
import { useParams } from "react-router-dom";
import { useSaveBoardColumn } from "@/hooks";
import { useAuthContext } from "@/hooks";

enum BoardModalContent {
  EMPTY,
  COLUMN,
  ITEM,
}

export const Board = () => {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [boardModalContent, setBoardModalContent] = useState(
    BoardModalContent.EMPTY
  );
  const [saveItemContainer, setSaveItemContainer] = useState<string | null>(
    null
  );
  const [boardColumns, setBoardColumn] = useState<BoardType[]>([]);
  const { supabaseClient } = useAuthContext();
  const { id } = useParams();
  const { saveBoardColumn } = useSaveBoardColumn();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 8,
        distance: 8,
      },
    }),
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

  if (!supabaseClient) {
    return <>no client</>;
  }

  const addBoardItem = (
    e: React.FormEvent<BoardColumnFormElement>,
    columnId: UniqueIdentifier | null
  ) => {
    e.preventDefault();
    if (!columnId) {
      //TODO: handle existing board card
      return;
    }
    const boardTitle = e.currentTarget.elements.boardColumnTitle.value;
    const isAlreadyPresent = boardColumns.find((column) => {
      return column.items.find(
        (item) => item.id.replace("-card", "") === boardTitle
      );
    });
    if (isAlreadyPresent) {
      // TODO: implement error case
      return;
    }
    const columnToEdit = boardColumns.find((col) => col.id === columnId);
    if (!columnToEdit) return;
    columnToEdit.items.push({ id: `${boardTitle}-card`, title: boardTitle });

    setBoardColumn((prevColumns) => {
      const newColumns = prevColumns.map((column) => {
        if (column.id === columnId) {
          column.items = columnToEdit.items;
        }
        return column;
      });
      return newColumns;
    });
  };

  const addBoardColumn = async (e: React.FormEvent<BoardColumnFormElement>) => {
    e.preventDefault();
    const boardTitle = e.currentTarget.elements.boardColumnTitle.value;
    if (!boardTitle) return;
    const isAlreadyPresent = boardColumns.find(
      (column) => column.title === boardTitle
    );
    if (isAlreadyPresent) {
      // TODO: implement error case
      return;
    }

    const newColumn = await saveBoardColumn(
      {
        board_id: parseInt(id as string),
        title: boardTitle,
        index: boardColumns.length,
      },
      supabaseClient
    );

    if (!newColumn) {
      // TODO: handle request error
      return;
    }

    setBoardColumn([
      ...boardColumns,
      {
        id: `${newColumn.id}-container`,
        title: newColumn.title,
        items: [],
      },
    ]);
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
        <button
          onClick={() => {
            setBoardModalContent(BoardModalContent.COLUMN);
            setIsModalOpen(true);
          }}
        >
          open modal
        </button>
        {isModalOpen && (
          <Portal
            closeModal={() => {
              setBoardModalContent(BoardModalContent.EMPTY);
              setIsModalOpen(false);
            }}
          >
            {boardModalContent === BoardModalContent.COLUMN && (
              <AddBoardColumn callback={addBoardColumn} />
            )}
            {boardModalContent === BoardModalContent.ITEM && (
              <AddBoardItem
                callback={addBoardItem}
                containerId={saveItemContainer}
              />
            )}
          </Portal>
        )}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={(e) =>
            handleDragEnd(e, boardColumns, setBoardColumn, setActiveId)
          }
          onDragStart={(e) => handleDragStart(e, setActiveId)}
        >
          <SortableContext items={boardColumns.map((i) => i.id)}>
            {boardColumns.map((container) => (
              <BoardContainer
                id={container.id}
                title={container.title}
                key={container.id}
                onAddItem={() => {
                  setBoardModalContent(BoardModalContent.ITEM);
                  setIsModalOpen(true);
                  setSaveItemContainer(container.id);
                }}
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
                onAddItem={() => {
                  setBoardModalContent(BoardModalContent.ITEM);
                  setIsModalOpen(true);
                }}
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
