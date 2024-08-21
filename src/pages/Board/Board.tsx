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
import { Error, Loading } from "@/components";
import styles from "@/styles/Board.module.scss";
import {
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { handleDragEnd, handleDragStart } from "./handlers";
import {
  AddBoardItem,
  BoardListCard,
  Portal,
  BoardContainer,
  AddBoardColumn,
} from "@/components";
import { BoardColumnFormElement, BoardType } from "@/types";
import { useParams } from "react-router-dom";
import {
  useAuthContext,
  useFetchBoardColumns,
  useSaveBoardColumn,
  useUpdateBoardColumn,
} from "@/hooks";
import { useDeleteBoardColumn } from "@/hooks/api/useDeleteBoardColumn";
import { BoardPrefixes } from "@/constants/constants";

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
  const { id } = useParams();
  const [boardColumns, setBoardColumn] = useState<BoardType[]>([]);
  const { error, loading } = useFetchBoardColumns(
    parseInt(id as string),
    setBoardColumn
  );
  const { error: updateError, updateBoardColumn } = useUpdateBoardColumn();
  const { error: saveError, saveBoardColumn } = useSaveBoardColumn();
  const { error: deleteError, deleteBoardColumn } = useDeleteBoardColumn();
  const { supabaseClient } = useAuthContext();
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

  const sanitizeBoardId = (containerId: string) =>
    parseInt(containerId.replace(BoardPrefixes.COLUMN, ""));

  const addBoardItem = (
    e: React.FormEvent<BoardColumnFormElement>,
    columnId: UniqueIdentifier | null
  ) => {
    e.preventDefault();
    if (!columnId) {
      return;
    }
    const boardTitle = e.currentTarget.elements.boardColumnTitle.value;
    // TODO: remove when implement item db requests
    const isAlreadyPresent = boardColumns.find((column) => {
      return column.items.find(
        (item) => item.id.replace("-card", "") === boardTitle
      );
    });
    if (isAlreadyPresent) {
      return;
    }
    // end TODO
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
    //TODO: implement form check
    if (!boardTitle) return;

    const newColumn = await saveBoardColumn(
      {
        board_id: parseInt(id as string),
        title: boardTitle,
        index: boardColumns.length,
      },
      supabaseClient
    );

    if (!newColumn) {
      return;
    }

    setBoardColumn([
      ...boardColumns,
      {
        id: `${newColumn.id}-container`,
        title: newColumn.title,
        items: [],
        index: boardColumns.length + 1,
      },
    ]);
  };

  const deleteBoardContainer = async (containerId: string) => {
    await deleteBoardColumn(sanitizeBoardId(containerId), supabaseClient);
    setBoardColumn((prevColumns) => {
      const newColumns = prevColumns
        .filter((currentContainer) => containerId !== currentContainer.id)
        .map((container, idx) => {
          container.index = idx;
          return container;
        });
      newColumns.forEach((column) =>
        updateBoardColumn({
          id: sanitizeBoardId(column.id),
          index: column.index,
        })
      );
      return newColumns;
    });
  };

  if (error || saveError || updateError || deleteError) {
    return <Error />;
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className={styles.container}>
        <button
          className={styles.addList}
          onClick={() => {
            setBoardModalContent(BoardModalContent.COLUMN);
            setIsModalOpen(true);
          }}
        >
          Add list
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
            handleDragEnd(
              e,
              boardColumns,
              setBoardColumn,
              setActiveId,
              updateBoardColumn
            )
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
                onDelete={() => deleteBoardContainer(container.id)}
                description=""
              >
                <SortableContext
                  id={container.id}
                  items={container.items.map((i) => i.id)}
                >
                  <div className={styles.listcard}>
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
                onDelete={() => {}}
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
