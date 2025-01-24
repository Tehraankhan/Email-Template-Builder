import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import {
  DndContext,
  DragEndEvent,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// DraggableItem component
const DraggableItem = ({ id, children, onDoubleClick, style, isSelected }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const draggableStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: "10px",
    marginBottom: "10px",
    cursor: "move",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    border: isSelected ? "2px solid blue" : "1px solid transparent",
    ...style, // Apply dynamic style
  };

  return (
    <div
      ref={setNodeRef}
      style={draggableStyle}
      {...attributes}
      {...listeners}
      onDoubleClick={onDoubleClick} // Handle double-click
    >
      {children}
    </div>
  );
};

const data = [
  {
    id: "title",
    type: "title",
    content: "Welcome to Our Service",
    style: { textAlign: "center", color: "white", fontSize: "18px" },
  },
  {
    id: "content",
    type: "text",
    content: "We're excited to have you on board.",
    style: { textAlign: "center", color: "white", fontSize: "16px" },
  },
  {
    id: "footer",
    type: "footer",
    content: "Thank you for choosing us!",
    style: { textAlign: "center", color: "white", fontSize: "14px" },
  },
  {
    id: "image",
    type: "image",
    src: "",
    style: { height: "300px", width: "300px", margin: "auto" },
  },
];

const App = () => {
  const [loading, setLoading] = useState("");
  const [items, setItems] = useState();

  const [parentStyle, setParentStyle] = useState();
  const fetchDataAndTemplate = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://email-template-builder-backend-2fm4.onrender.com/api/emails/getTemplateData",
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const response2 = await axios.get(
        "https://email-template-builder-backend-2fm4.onrender.com/api/emails/getTemplate",
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const originalTemplate = response2.data; // Fetch and store the original template
      console.log(response.data[0].sections);

      const { children: initialItems, parentStyle: parsedParentStyle } =
        parseTemplate(originalTemplate, response.data[0].sections);

      // Update the state for items and parent style
      setItems(initialItems);
      setParentStyle(parsedParentStyle);
      setLoading(false);

      const fullUrl = response.data[0].sections[2].src;
      const fileName = fullUrl.split("/").pop();

      console.log(fileName);

      setImagePreview({
        url: fullUrl,
        fileName: fileName,
      });
      items[2].src = fullUrl;
      setImage(fullUrl);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchDataAndTemplate();
  }, []);

  const parseTemplate = (template, sections, image) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(template, "text/html");

    const elements = [...doc.body.children];

    // Extract parent style
    const parentElement = elements.find((el) => el.id === "parent");
    const parentStyle = parentElement
      ? Array.from(parentElement.style).reduce((styleObj, prop) => {
          styleObj[prop] = parentElement.style.getPropertyValue(prop);
          return styleObj;
        }, {})
      : {};

    // Parse child elements
    const children = parentElement ? [...parentElement.children] : elements;

    const parsedChildren = children.map((el) => {
      // Match section from response
      const matchedSection = sections.find((section) => section.id === el.id);

      const parsedElement = {
        id:
          el.id ||
          `${el.tagName.toLowerCase()}-${Math.random()
            .toString(36)
            .substring(2, 8)}`,
        type: matchedSection?.type || el.tagName.toLowerCase(),
        content: matchedSection?.content || el.textContent.trim(),
        style:
          matchedSection?.style ||
          Array.from(el.style).reduce((styleObj, prop) => {
            styleObj[prop] = el.style.getPropertyValue(prop);
            return styleObj;
          }, {}),
      };

      // Special handling for <div> elements with an <img> tag
      if (el.id === "image" || matchedSection?.type === "image") {
        const imgElement = el.querySelector("img"); // Locate <img> tag
        parsedElement.type = "img"; // Change type to 'img'
        parsedElement.src =
          matchedSection?.src || imgElement?.src || image || ""; // Use matchedSection src or fallback
        parsedElement.style =
          matchedSection?.style ||
          (imgElement
            ? Array.from(imgElement.style).reduce((styleObj, prop) => {
                styleObj[prop] = imgElement.style.getPropertyValue(prop);
                return styleObj;
              }, {})
            : {});
      }

      return parsedElement;
    });

    return { children: parsedChildren, parentStyle };
  };

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState({
    url: "",
    fileName: "",
  });
  const [originalTemplate, setoriginalTemplate] = useState("");

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    

    // Check if a file is selected
    if (!file) {
      alert("Please select an image.");
      return;
    }

    // Create a FormData object to send the image to the server
    const formData = new FormData();
    formData.append("image", file);

    try {
      setIsSaving(true)
      // Send the image to the server using Axios
      const response = await axios.post(
        "https://email-template-builder-backend-2fm4.onrender.com/api/emails/uploadImage",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Extract the full URL and file name from the server response
      const relativeUrl = response.data.imageUrl; // e.g., "/uploads/1737624684544.png"
      const fullUrl = `https://email-template-builder-backend-2fm4.onrender.com${relativeUrl}`;
      const fileName = relativeUrl.split("/").pop(); // Extracts "1737624684544.png"

      console.log(fileName);

      // Update states with the full URL and file name
      setImage(fullUrl);
      setImagePreview({
        url: fullUrl,
        fileName: fileName,
      });

      // Update items array

      const updatedItems = items.map((item) =>
        item.id === "image" ? { ...item, src: fullUrl } : item
      );

      // Update the items state
      setItems(updatedItems);

      alert("Image uploaded successfully!");
      setIsSaving(false)
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image. Please try again.");
      setIsSaving(false)
    }
  };

  const UpdateDataAndTemplate = async () => {
    try {
      const htmlCode = generateHTMLCode(); // Assuming this function generates your HTML code
      console.log(htmlCode);
      console.log(items);
      const response = await axios.put(
        "https://email-template-builder-backend-2fm4.onrender.com/api/emails/updateData",
        { sections: items }, // Correctly passing an object instead of JSON.stringify
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const response2 = await axios.put(
        "https://email-template-builder-backend-2fm4.onrender.com/api/emails/updateTemplate",
        { html: htmlCode }, // Correctly passing an object instead of JSON.stringify
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Access response data correctly
    } catch (error) {
      console.error("Error updating template:", error.message);
    }
  };

  const [selectedItemId, setSelectedItemId] = useState(null);
  const [newContent, setNewContent] = useState("");
  const [newFontSize, setNewFontSize] = useState("16px");
  const [newColor, setNewColor] = useState("#000");
  const [newTextAlign, setNewTextAlign] = useState("left");
  const [borderColor, setBorderColor] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleItemDoubleClick = (id) => {
    setSelectedItemId(id);
    console.log(selectedItemId);
    const selectedItem = items.find((item) => item.id === id);
    console.log(selectedItem.style.fontSize);
    if (selectedItem) {
      setNewContent(selectedItem.content);
      setNewFontSize(selectedItem.style.fontSize || "16px");
      setNewColor(selectedItem.style.color || "#000");
      setNewTextAlign(selectedItem.style.textAlign || "left");
    }
  };

  const handleContentChange = (e) => {
    setNewContent(e.target.value);
    // Update the item content immediately when input changes
    const updatedItems = items.map((item) =>
      item.id === selectedItemId ? { ...item, content: e.target.value } : item
    );
    setItems(updatedItems);
  };

  const handleFontSizeChange = (e) => {
    setNewFontSize(e.target.value + "px");
    const updatedItems = items.map((item) =>
      item.id === selectedItemId
        ? { ...item, style: { ...item.style, fontSize: e.target.value + "px" } }
        : item
    );
    setItems(updatedItems);
  };

  const handleColorChange = (e) => {
    setNewColor(e.target.value);
    const updatedItems = items.map((item) =>
      item.id === selectedItemId
        ? { ...item, style: { ...item.style, color: e.target.value } }
        : item
    );
    setItems(updatedItems);
  };

  const handleTextAlignChange = (value) => {
    setNewTextAlign(value);
    const updatedItems = items.map((item) =>
      item.id === selectedItemId
        ? { ...item, style: { ...item.style, textAlign: value } }
        : item
    );
    setItems(updatedItems);
  };

  const camelCaseToKebabCase = (str) =>
    str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

  const generateHTMLCode = () => {
    const parentStyleString = Object.entries(parentStyle)
      .map(([key, value]) => `${camelCaseToKebabCase(key)}: ${value}`)
      .join("; ");

    const childrenHTML = items
      .map((item) => {
        const itemStyleString = Object.entries(item.style || {})
          .map(([key, value]) => `${camelCaseToKebabCase(key)}: ${value}`)
          .join("; ");

        if (item.type === "img") {
          return `
          <div style="${itemStyleString}" >

          <img id="${item.id}" src="${
            image || item.src || "ss"
          }" style="${itemStyleString}" alt="preview" />
          
          </div>`;
        }

        return `<div id="${item.id}" style="${itemStyleString}; padding: 10px; bottom: 10px;">${item.content}</div>`;
      })
      .join("\n");

    return `<div id="parent" style="${parentStyleString}">
    ${childrenHTML}
  </div>`;
  };

  const handleDownloadHtml = async () => {
    try {
      const response = await axios.post(
        "https://email-template-builder-backend-2fm4.onrender.com/api/emails/renderAndDownloadTemplate",
        {
          responseType: "blob", // Important for handling file responses
        }
      );

      // Create a download link for the file
      const blob = new Blob([response.data], { type: "text/html" });
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const a = document.createElement("a");
      a.href = url;
      a.download = "emailTemplate.html"; // File name for download
      document.body.appendChild(a);

      // Trigger the download
      a.click();

      // Clean up
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading the HTML:", error);
      alert("Failed to download the file. Please try again.");
    }
  };

  useEffect(() => {
    UpdateDataAndTemplate();
  }, [items]);
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {isSaving && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            width: "200px",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            boxSizing: "border-box",
            backgroundColor: "#fff",
            textAlign: "center",
            
          }}
        >
          Saving.....
        </div>
      )}
      {/* Left Section (Input Fields for Editing Content and Style) */}
      <div
        style={{
          width: "300px",
          padding: "20px",
          backgroundColor: "#f9f9f9",
          borderRight: "1px solid #ddd",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          fontFamily: "'Arial', sans-serif",
        }}
      >
        <h3 style={{ marginBottom: "20px", color: "#333" }}>Toolbox</h3>

        {/* Content Editor */}
        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ marginBottom: "10px", color: "#555" }}>Edit Content</h4>
          <input
            type="text"
            value={newContent}
            onChange={handleContentChange}
            placeholder="Enter content..."
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Font Size */}
        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ marginBottom: "10px", color: "#555" }}>Font Size</h4>
          <input
            type="number"
            value={parseInt(newFontSize)}
            onChange={handleFontSizeChange}
            min="8"
            max="72"
            placeholder="Font size"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Color Picker */}
        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ marginBottom: "10px", color: "#555" }}>Text Color</h4>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              backgroundColor: "#f9f9f9",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            {/* Color Picker */}
            <input
              type="color"
              value={newColor}
              onChange={handleColorChange}
              style={{
                width: "50px",
                height: "40px",
                border: "none",
                cursor: "pointer",
                borderRadius: "6px",
              }}
            />
            {/* Color Value Display */}
            <div
              style={{
                flex: 1,
                padding: "10px",
                textAlign: "center",
                fontFamily: "'Courier New', monospace",
                fontSize: "14px",
              }}
            >
              {newColor.toUpperCase()} {/* Displaying HEX value */}
            </div>
          </div>
        </div>

        {/* Text Alignment */}
        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ marginBottom: "10px", color: "#555" }}>
            Text Alignment
          </h4>
          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            <button
              onClick={() => handleTextAlignChange("left")}
              style={{
                flex: 1,
                padding: "10px",
                backgroundColor:
                  newTextAlign === "left" ? "#007BFF" : "#f5f5f5",
                color: newTextAlign === "left" ? "#fff" : "#333",
                border: "1px solid #ddd",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Left
            </button>
            <button
              onClick={() => handleTextAlignChange("center")}
              style={{
                flex: 1,
                padding: "10px",
                backgroundColor:
                  newTextAlign === "center" ? "#007BFF" : "#f5f5f5",
                color: newTextAlign === "center" ? "#fff" : "#333",
                border: "1px solid #ddd",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {" "}
              Center
            </button>
            <button
              onClick={() => handleTextAlignChange("right")}
              style={{
                flex: 1,
                padding: "10px",
                backgroundColor:
                  newTextAlign === "right" ? "#007BFF" : "#f5f5f5",
                color: newTextAlign === "right" ? "#fff" : "#333",
                border: "1px solid #ddd",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Right
            </button>
          </div>
        </div>

        {/* Image Upload */}
        <div style={{ marginBottom: "20px" }}>
          {/* Choose File Button */}
          <h4 style={{ marginBottom: "10px", color: "#555" }}>Upload Image</h4>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              boxSizing: "border-box",
              backgroundColor: "#fff",
              marginBottom: "10px",
            }}
          />

          {/* Image Preview and File Name on the Same Line */}
          {imagePreview.url && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: "10px",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                backgroundColor: "#f9f9f9",
              }}
            >
              {/* Uploaded Image */}
              <img
                src={imagePreview.url}
                alt="Uploaded"
                style={{
                  width: "50px",
                  height: "50px",
                  objectFit: "cover",
                  borderRadius: "6px",
                  marginRight: "10px",
                }}
              />

              {/* File Name */}
              <span
                style={{
                  color: "#333",
                  fontSize: "14px",
                  wordBreak: "break-word",
                }}
              >
                {imagePreview.fileName}
              </span>
            </div>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={handleDownloadHtml}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#007BFF",
            color: "#fff",
            borderRadius: "6px",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Download HTML
        </button>
      </div>

      {/* Right Section (Template Preview) */}
      <div
        style={{
          width: "100%",
          padding: "20px",
          backgroundColor: "#ffffff",
          overflowY: "auto",
          margin: "auto",
        }}
      >
        {loading || !items || items.length === 0 ? (
          <>
            <p>loading...</p>
          </>
        ) : (
          <>
            <div style={parentStyle}>
              <DndContext onDragEnd={handleDragEnd}>
                <SortableContext
                  items={items}
                  strategy={verticalListSortingStrategy}
                >
                  {items.map((item) => (
                    <DraggableItem
                      key={item.id}
                      id={item.id}
                      style={item.style}
                      isSelected={item.id === selectedItemId}
                      onDoubleClick={() => handleItemDoubleClick(item.id)}
                    >
                      {item.type === "img" ? (
                        <img
                          src={item.src || image}
                          alt="preview"
                          style={item.style}
                        />
                      ) : (
                        <div
                          style={{
                            ...item.style,
                            textAlign: item.style.textAlign,
                          }}
                        >
                          {item.content}
                        </div>
                      )}
                    </DraggableItem>
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
