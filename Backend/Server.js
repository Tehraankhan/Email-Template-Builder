const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const cors = require("cors"); // Import CORS
const emailRoutes = require("./src/routes/emailTemplateRoute");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
dotenv.config();
app.use(cors()); // Enable CORS for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set up multer for image file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// MongoDB connection
mongoose.connect(process.env.MONGO_URL, { dbName: "Test" })
  .then(() => console.log("MongoDB connected to Test database"))
  .catch(err => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/emails", emailRoutes);

// API to get the layout HTML file
app.get("/getEmailLayout", (req, res) => {
  const layoutPath = path.join(__dirname, "views", "layout.html");

  fs.readFile(layoutPath, "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading layout.html:", err);
      return res.status(500).json({ error: "Error reading HTML layout" });
    }

    res.status(200).send(data);
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
