"use client";

import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { GripVertical } from "lucide-react";
import type { ReactNode } from "react";

type SavedPlace = {
  id: string;
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
};

export function PinnedList({
  items,
  onReorder,
  renderItem,
  empty,
}: {
  items: SavedPlace[];
  onReorder: (next: SavedPlace[]) => void;
  renderItem: (place: SavedPlace) => ReactNode;
  empty: ReactNode;
}) {
  function handleDragEnd(result: DropResult) {
    if (!result.destination) return;
    const src = result.source.index;
    const dst = result.destination.index;
    if (src === dst) return;

    const next = [...items];
    const [moved] = next.splice(src, 1);
    next.splice(dst, 0, moved);
    onReorder(next);
  }

  if (items.length === 0) {
    return <>{empty}</>;
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="pinned-list" direction="vertical">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {items.map((place, index) => (
              <Draggable key={place.id} draggableId={place.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    style={{
                      ...provided.draggableProps.style,
                      zIndex: snapshot.isDragging ? 50 : "auto",
                    }}
                    className={`group ${
                      snapshot.isDragging ? "shadow-lg" : ""
                    }`}
                  >
                    <div
                      {...provided.dragHandleProps}
                      className="mb-1 flex items-center gap-2 text-muted-foreground cursor-grab"
                    >
                      <GripVertical
                        className="h-4 w-4 opacity-70 transition-opacity hover:opacity-100"
                        aria-label="Drag to reorder"
                      />
                      <span className="text-xs">Drag</span>
                    </div>
                    {renderItem(place)}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
