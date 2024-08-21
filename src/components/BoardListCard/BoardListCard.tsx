import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
        padding: "32px",
        margin: "32px",
      }}
    >
      <div className="flex items-center justify-between">{title}</div>
    </div>
  );
};
