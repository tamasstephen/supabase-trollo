import Plus from "@/assets/plus.svg";
import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import {
  useRef,
  FormEvent,
  PropsWithChildren,
  useEffect,
  useState,
  KeyboardEvent,
} from "react";
import { CSS } from "@dnd-kit/utilities";
import styles from "@/styles/BoardContainer.module.scss";
import DeleteIcon from "@/assets/delete.svg";
import { TaskFormElement } from "@/types/FormTypes";
import { Button } from "../Button";
import { ButtonStyle } from "@/constants";
import { DbObject } from "@/types";

interface ContainerProps extends PropsWithChildren {
  id: string | UniqueIdentifier;
  title: string;
  description?: string;
  callback: (
    e: React.FormEvent<TaskFormElement>,
    columnId: UniqueIdentifier
  ) => Promise<DbObject | undefined>;
  onDelete: () => void;
}

export const BoardContainer = ({
  id,
  children,
  title,
  description,
  callback,
  onDelete,
}: ContainerProps) => {
  const {
    attributes,
    setNodeRef,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: id,
    data: {
      type: "container",
    },
  });
  const textArea = useRef<HTMLTextAreaElement>(null);
  const submitButton = useRef<HTMLButtonElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [addTaskDisabled, setAddTaskDisabled] = useState(false);

  const onSubmit = async (event: FormEvent<TaskFormElement>) => {
    setAddTaskDisabled(true);
    event.preventDefault();
    const res = await callback(event, id);
    if (res) {
      setAddTaskDisabled(false);
    }
  };

  const handleKeydown = (e: KeyboardEvent) => {
    e.stopPropagation();
    if (!textArea.current) {
      return;
    }
    if (e.key === "Enter" && e.shiftKey === false) {
      e.preventDefault();
      if (textArea.current?.value) {
        submitButton.current?.click();
      }
      textArea.current?.blur();
      textArea.current.value = "";
      setShowForm(false);
    }
    if (e.key === "Escape") {
      setShowForm(false);
      textArea.current?.blur();
      textArea.current.value = "";
    }
  };

  useEffect(() => {
    if (showForm && textArea.current) {
      textArea.current.focus();
    }
  }, [showForm, textArea]);

  return (
    <div
      {...attributes}
      ref={setNodeRef}
      {...listeners}
      style={{
        transition,
        transform: CSS.Translate.toString(transform),
      }}
      className={`${styles.wrapper} ${isDragging ? styles.dragged : ""}`}
    >
      <div>
        <div className={styles.header}>
          <h2>{title}</h2>
          <button
            className={styles.close}
            data-testid="deletecolumn"
            onClick={onDelete}
          >
            <DeleteIcon />
          </button>
        </div>
        {description && <p>{description}</p>}
      </div>

      {children}
      <form
        onSubmit={onSubmit}
        className={
          !showForm ? styles.newCardFormInactive : styles.newCardFormActive
        }
      >
        <textarea
          ref={textArea}
          className={styles.taskInput}
          name="taskTitle"
          id="taskTitle"
          onKeyDown={handleKeydown}
          data-testid="textarea"
        ></textarea>
        <button
          ref={submitButton}
          type="submit"
          className={styles.hiddenButton}
          name="submit"
        ></button>
      </form>
      {!showForm && (
        <Button
          type="button"
          style={ButtonStyle.DASHED}
          onClick={() => setShowForm(true)}
          disabled={addTaskDisabled}
        >
          <Plus />
          Add new task
        </Button>
      )}
    </div>
  );
};
