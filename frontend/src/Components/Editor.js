import React, { useState } from "react";
import { DndContext } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem"; // Custom sortable item component
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

const Editor = () => {
  const [items, setItems] = useState([
    { id: "1", content: "Header Section" },
    { id: "2", content: "Body Section" },
    { id: "3", content: "Footer Section" },
  ]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
  
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const updatedItems = arrayMove(items, oldIndex, newIndex);
      setItems(updatedItems);
  
      // Send the updated layout to the backend
      await updateLayoutOnServer(updatedItems);
    }
  };
  
  // Function to send updated layout to backend
  const updateLayoutOnServer = async (updatedItems) => {
    try {
      const response = await fetch("http://localhost:5000/update-layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layout: updatedItems }),
      });
  
      if (!response.ok) {
        console.error("Failed to update layout on server");
      }
    } catch (error) {
      console.error("Error updating layout:", error);
    }
  };
  

  return (
    <div className="editor">
      <h2>Email Template Editor</h2>
      <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableItem key={item.id} id={item.id} content={item.content} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default Editor;
