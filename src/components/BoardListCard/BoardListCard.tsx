import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "@/styles/BoardListCard.module.scss";

type ItemsType = {
  id: UniqueIdentifier;
  title: string;
};

export const BoardListCard = ({ id, title }: ItemsType) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
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
      className={styles.card}
    >
      <div className="flex items-center justify-between">{title}</div>
    </div>
  );
};
