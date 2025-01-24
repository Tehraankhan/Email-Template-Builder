const express = require("express");
const fs = require("fs");
const path = require("path");
const Email = require("../models/emailTemplateDataSchema");
const multer = require("multer");

const router = express.Router();

// Image upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// API to upload image
router.post("/uploadImage", upload.single("image"), (req, res) => {
    console.log()
  if (!req.file) {
    return res.status(400).send({ message: "No image uploaded" });
  }
  res.status(200).send({ imageUrl: `/uploads/${req.file.filename}` });
});

// API to upload email configuration
router.post("/uploadEmailConfig", async (req, res) => {
  const { sections, templateName } = req.body;

  try {
    const newEmailTemplate = new Email({
      sections,
      templateName
    });

    await newEmailTemplate.save();

    res.status(201).send({
      message: "Email template uploaded successfully",
      emailTemplate: newEmailTemplate
    });
  } catch (error) {
    res.status(500).send({
      message: "Error saving email template",
      error
    });
  }
});

router.put("/updateData", async (req, res) => {
  const { sections}= req.body;
  const templateName ="layout.html"
  console.log(sections)

  try {
    // Check if a template with the given templateName exists
    const existingTemplate = await Email.findOne({ templateName });

    if (existingTemplate) {
      // Update the existing template
      existingTemplate.sections = sections; // Update the sections
      await existingTemplate.save();

      res.status(200).send({
        message: "Email template updated successfully",
        emailTemplate: existingTemplate
      });
    } else {
      // Create a new template if it doesn't exist
      const newEmailTemplate = new Email({
        sections,
        templateName
      });

      await newEmailTemplate.save();

      res.status(201).send({
        message: "Email template uploaded successfully",
        emailTemplate: newEmailTemplate
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Error saving or updating email template",
      error
    });
  }
});



router.get("/getTemplateData", async (req, res) => {


  try {
    const newEmailTemplate = await Email.find({ templateName: "layout.html" });

  console.log(newEmailTemplate)

    res.status(201).send(newEmailTemplate
);
  } catch (error) {
    res.status(500).send({
      message: "Error saving email template",
      error
    });
  }
});


router.get("/getTemplate", async (req, res) => {


  const filePath = path.join(__dirname, "../views", "layout.html");

  // Read and send the file content
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return res.status(500).send({ message: "Error reading layout file" });
    }

    // Send the file content as the response
    res.send(data);
  });

});

router.put("/updateTemplate", (req, res) => {
  console.log("yes")
  
  const html = req.body.html
   
  console.log(html)

  if (!html) {
    return res.status(400).send({ message: "No HTML content provided" });
  }

  // console.log("Received HTML:", rawHtml);

  const filePath = path.join(__dirname, "../views", "layoutSave.html");
  fs.writeFileSync(filePath, html, "utf-8");

  res.status(200).send({ message: "Template updated successfully" });
});






// API to render and download the template with substituted values
router.post("/renderAndDownloadTemplate", async (req, res) => {
  
  

  const filePath = path.join(__dirname, "../views", "layoutSave.html");

  res.download(filePath, 'emailTemplate.html', (err) => {
    if (err) {
      console.error('Error sending file:', err);
    }

    
  });
});

module.exports = router;
