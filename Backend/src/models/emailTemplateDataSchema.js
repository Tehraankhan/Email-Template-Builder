const mongoose = require("mongoose");

const EmailTemplateSchema = new mongoose.Schema({
  sections: [
    {
      id: { type: String, required: true }, // Unique identifier for the section (e.g., "title", "content")
      type: { type: String, required: true }, // Type of the section (e.g., "title", "text", "footer", "image")
      content: { type: String, required: false }, // Text content (optional for images)
      src: { type: String, required: false }, // Image source URL (only for "image" type)
      style: { type: Object, required: false } // CSS-like style properties
    }
  ],
  templateName: { type: String, required: true }, // Name of the template (e.g., "layout.html")
  createdAt: { type: Date, default: Date.now }, // Creation timestamp
  updatedAt: { type: Date, default: Date.now } // Update timestamp
});
module.exports = mongoose.model("EmailTemplate", EmailTemplateSchema);
