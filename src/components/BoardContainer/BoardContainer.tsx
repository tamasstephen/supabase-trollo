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

interface ContainerProps extends PropsWithChildren {
  id: string | UniqueIdentifier;
  title: string;
  description?: string;
  callback: (
    e: React.FormEvent<TaskFormElement>,
    columnId: UniqueIdentifier | null
  ) => Promise<void>;
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

  const onSubmit = async (event: FormEvent<TaskFormElement>) => {
    event.preventDefault();
    await callback(event, id);
    setShowForm(false);
  };

  const handleKeydown = (e: KeyboardEvent) => {
    e.stopPropagation();
    if (!textArea.current) {
      return;
    }
    if (e.key === "Enter" && e.shiftKey === false) {
      e.preventDefault();
      submitButton.current?.click();
      textArea.current?.blur();
      textArea.current.value = "";
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
          <button className={styles.close} onClick={onDelete}>
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
        ></textarea>
        <button
          ref={submitButton}
          type="submit"
          className={styles.hiddenButton}
          name="submit"
        ></button>
      </form>
      {!showForm && (
        <button
          type="button"
          className={styles.add}
          onClick={() => {
            setShowForm(true);
          }}
        >
          Add new card
        </button>
      )}
    </div>
  );
};
