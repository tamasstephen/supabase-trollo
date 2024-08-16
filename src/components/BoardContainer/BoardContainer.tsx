import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { PropsWithChildren } from "react";
import { CSS } from "@dnd-kit/utilities";

interface ContainerProps extends PropsWithChildren {
  id: string | UniqueIdentifier;
  title: string;
  description?: string;
  onAddItem: () => void;
}

export const BoardContainer = ({
  id,
  children,
  title,
  description,
  onAddItem,
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
        margin: "32px",
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{ border: "1px solid black", padding: "1rem" }}
      >
        <div className="flex flex-col gap-y-1">
          <h1 className="text-gray-800 text-xl">{title}</h1>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
      </div>

      {children}
      <button onClick={onAddItem}>Add Item</button>
    </div>
  );
};
