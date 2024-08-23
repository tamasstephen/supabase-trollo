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
import { BoardColumnFormElement, DraggableBoardContainer } from "@/types";
import { useParams } from "react-router-dom";
import {
  useAuthContext,
  useFetchBoardColumns,
  useUpdateBoardColumn,
} from "@/hooks";
import { useDeleteBoardColumn } from "@/hooks/api/useDeleteBoardColumn";
import { BoardPrefixes, TableNames } from "@/constants/constants";
import { useSave } from "@/hooks/api/useSave";
import { BoardColumnType, Task } from "@/types/Board";

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
  const [boardColumns, setBoardColumn] = useState<DraggableBoardContainer[]>(
    []
  );
  const { error, loading } = useFetchBoardColumns(
    parseInt(id as string),
    setBoardColumn
  );
  const { error: updateColumnError, updateBoardColumn } =
    useUpdateBoardColumn();

  const { error: deleteColumnError, deleteBoardColumn } =
    useDeleteBoardColumn();

  const { error: saveError, saveToDb } = useSave();
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

  const hasToShowError = error || saveError;
  updateColumnError || deleteColumnError;

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

  const addNewTask = async (
    e: React.FormEvent<BoardColumnFormElement>,
    columnId: UniqueIdentifier | null
  ) => {
    e.preventDefault();
    if (!columnId) {
      return;
    }
    const boardTitle = e.currentTarget.elements.boardColumnTitle.value;
    const columnToEdit = boardColumns.find((col) => col.id === columnId);
    if (!columnToEdit) return;
    const task = await saveToDb<Task>(
      {
        index: columnToEdit.items.length,
        title: boardTitle,
        board_id: sanitizeBoardId(columnId as string),
      },
      TableNames.TASK
    );
    if (!task) return;
    const newId = `${BoardPrefixes.ITEM}${task.id}`;
    columnToEdit.items.push({ ...task, id: newId });

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

    const newColumn = await saveToDb<BoardColumnType>(
      {
        board_id: parseInt(id as string),
        title: boardTitle,
        index: boardColumns.length,
      },
      TableNames.COLUMN
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

  if (hasToShowError) {
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
                callback={addNewTask}
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
                <div className={styles.listcard}>
                  {activeContainer?.items.map((i) => (
                    <BoardListCard key={i.id} title={i.title} id={i.id} />
                  ))}
                </div>
              </BoardContainer>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};
