import { useState } from "react";
import { UniqueIdentifier } from "@dnd-kit/core";
import styles from "@/styles/Board.module.scss";
import { Portal, Error, Loading } from "@/components";
import { DraggableBoardContainer, BoardColumnType, Task } from "@/types";
import { useNavigate, useParams } from "react-router-dom";
import {
  useFetchBoardColumns,
  useUpdate,
  useSave,
  useFetchBoard,
} from "@/hooks";
import { BoardPrefixes, TableNames } from "@/constants";
import {
  findActiveBoardListCard,
  sanitizeDraggableId,
  findActiveContainers,
  updateContainerTasks,
} from "./helpers";
import { useDelete } from "@/hooks/api/useDelete";
import { InputTypes, TaskFormElement } from "@/types/FormTypes";
import {
  BoardHeader,
  ContainerList,
  AddBoardColumn,
  DeleteBoard,
} from "./components";

enum ModalContent {
  ADD_LIST,
  DELETE_BOARD,
}

export const Board = () => {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(ModalContent.ADD_LIST);
  const { id } = useParams();
  const [boardColumns, setBoardColumn] = useState<DraggableBoardContainer[]>(
    []
  );
  const {
    error: boardError,
    loading: boardLoading,
    data: boardData,
  } = useFetchBoard(id);
  const { error, loading } = useFetchBoardColumns(
    parseInt(id as string),
    setBoardColumn
  );
  const { error: updateError, updateItem } = useUpdate();
  const { error: deleteError, deleteItem } = useDelete();
  const { error: saveError, saveToDb } = useSave();

  const hasToShowError = error || saveError;
  updateError || deleteError || boardError;

  const activeContainer = findActiveContainers(
    activeId as string,
    boardColumns
  );
  const activeCard = findActiveBoardListCard(activeId as string, boardColumns);

  const addNewTask = async (
    e: React.FormEvent<TaskFormElement>,
    columnId: UniqueIdentifier
  ) => {
    e.preventDefault();
    const boardTitle = e.currentTarget.elements.taskTitle.value;
    const columnToEdit = boardColumns.find((col) => col.id === columnId);
    if (!columnToEdit) return;
    const task = await saveToDb<Task>(
      {
        index: columnToEdit.items.length,
        title: boardTitle,
        board_id: sanitizeDraggableId(columnId as string),
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

  const addBoardColumn = async (data: Pick<InputTypes, "boardColumnTitle">) => {
    const boardTitle = data.boardColumnTitle as string;
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

  const deleteTask = (taskId: string) => {
    const columnToUpdate = boardColumns.find((column) =>
      column.items.find((item) => item.id === taskId)
    );
    if (!columnToUpdate) {
      return;
    }
    deleteItem(
      sanitizeDraggableId(taskId, BoardPrefixes.ITEM),
      TableNames.TASK
    );
    setBoardColumn((prevColumns) => {
      const newColumns = prevColumns.map((column) => {
        if (column.id === columnToUpdate.id) {
          column.items = column.items.filter((item) => item.id !== taskId);
          updateContainerTasks(column, updateItem);
        }
        return column;
      });
      return newColumns;
    });
  };

  const deleteBoardContainer = async (containerId: string) => {
    await deleteItem(sanitizeDraggableId(containerId), TableNames.COLUMN);
    setBoardColumn((prevColumns) => {
      const newColumns = prevColumns
        .filter((currentContainer) => containerId !== currentContainer.id)
        .map((container, idx) => {
          container.index = idx;
          updateItem(
            {
              id: sanitizeDraggableId(container.id),
              index: container.index,
            },
            TableNames.COLUMN
          );
          return container;
        });
      return newColumns;
    });
  };

  const deleteBoard = () => {
    deleteItem(parseInt(id as string), TableNames.BOARD);
    navigate("/");
  };

  if (hasToShowError) {
    return <Error />;
  }

  if (loading || boardLoading) {
    return <Loading />;
  }

  return (
    <div>
      <BoardHeader
        deleteBoard={() => {
          setModalContent(ModalContent.DELETE_BOARD);
          setIsModalOpen(true);
        }}
        boardData={boardData}
        setIsModalOpen={() => {
          setModalContent(ModalContent.ADD_LIST);
          setIsModalOpen(true);
        }}
      />
      <div className={styles.container}>
        {isModalOpen && (
          <Portal closeModal={() => setIsModalOpen(false)}>
            {modalContent === ModalContent.ADD_LIST ? (
              <AddBoardColumn callback={addBoardColumn} />
            ) : (
              <DeleteBoard
                onCancel={() => setIsModalOpen(false)}
                onDelete={deleteBoard}
              />
            )}
          </Portal>
        )}
        <ContainerList
          boardColumns={boardColumns}
          setBoardColumn={setBoardColumn}
          setActiveId={setActiveId}
          updateItem={updateItem}
          addNewTask={addNewTask}
          deleteBoardContainer={deleteBoardContainer}
          deleteTask={deleteTask}
          activeId={activeId}
          activeContainer={activeContainer}
          activeCard={activeCard}
        />
      </div>
    </div>
  );
};
