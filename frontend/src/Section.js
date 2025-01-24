import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaImage } from "react-icons/fa";

function Section({
  id,
  type,
  content,
  textColor,
  textAlign,
  onContentChange,
  onSelect,
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: "15px",
    margin: "15px 0",
    borderRadius: "8px",
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    cursor: "grab",
    textAlign: textAlign,
    color: textColor,
    fontSize: "16px",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onSelect} // Select section on click
    >
      {type === "text" ? (
        <textarea
          value={content}
          onChange={(e) => onContentChange(id, e.target.value)}
          style={{
            width: "100%",
            height: "100px",
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            resize: "none",
            fontSize: "14px",
          }}
        />
      ) : (
        <div>
          {content ? (
            <img
              src={content}
              alt="Uploaded"
              style={{ maxWidth: "100%", marginBottom: "10px" }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "60px",
                border: "1px dashed #ccc",
                borderRadius: "5px",
                color: "#999",
                fontSize: "14px",
              }}
            >
              <FaImage style={{ marginRight: "5px" }} />
              No Image Uploaded
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              onContentChange(
                id,
                e.target.files[0] ? URL.createObjectURL(e.target.files[0]) : ""
              )
            }
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "5px",
              border: "1px solid #ddd",
              marginTop: "10px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          />
        </div>
      )}
    </div>
  );
}

export default Section;
