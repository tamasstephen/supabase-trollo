import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { PropsWithChildren } from "react";
import { CSS } from "@dnd-kit/utilities";
import styles from "@/styles/BoardContainer.module.scss";
import DeleteIcon from "@/assets/delete.svg";

interface ContainerProps extends PropsWithChildren {
  id: string | UniqueIdentifier;
  title: string;
  description?: string;
  onAddItem: () => void;
  onDelete: () => void;
}

export const BoardContainer = ({
  id,
  children,
  title,
  description,
  onAddItem,
  onDelete,
}: ContainerProps) => {
  const { attributes, setNodeRef, listeners, transform, transition } =
    useSortable({
      id: id,
      data: {
        type: "container",
      },
    });

  return (
    <div
      {...attributes}
      ref={setNodeRef}
      {...listeners}
      style={{
        transition,
        transform: CSS.Translate.toString(transform),
      }}
      className={styles.wrapper}
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
      <button className={styles.add} onClick={() => onAddItem()}>
        Add Item
      </button>
    </div>
  );
};
