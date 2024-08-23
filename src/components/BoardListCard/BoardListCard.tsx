import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "@/styles/BoardListCard.module.scss";
import Delete from "@/assets/delete.svg";

type ItemsType = {
  id: UniqueIdentifier;
  title: string;
  onDelete: (id: string) => void;
};

export const BoardListCard = ({ id, title, onDelete }: ItemsType) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: id,
    data: {
      type: "item",
    },
  });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transition,
        transform: CSS.Translate.toString(transform),
      }}
      className={`${styles.card} ${isDragging ? styles.dragged : ""}`}
    >
      <div className={styles.cardInner}>
        {title}
        <button
          className={styles.taskButton}
          onClick={() => onDelete(id as string)}
        >
          <Delete />
        </button>
      </div>
    </div>
  );
};
