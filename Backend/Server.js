const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors"); // Import CORS
const emailRoutes = require("./src/routes/emailTemplateRoute");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Set up multer for image file upload
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
mongoose.connect("mongodb+srv://20co49:BUQzVuJSWHGyfgz0@cluster0.n5ejt.mongodb.net/Test", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected to Test database"))
  .catch(err => console.log("MongoDB connection error:", err));

// Routes
app.use("/api/emails", emailRoutes);

// API to get the layout HTML file
app.get("/getEmailLayout", (req, res) => {
  fs.readFile(path.join(__dirname, "views", "layout.html"), "utf-8", (err, data) => {
    if (err) {
      return res.status(500).send("Error reading HTML layout");
    }
    res.status(200).send(data);
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
