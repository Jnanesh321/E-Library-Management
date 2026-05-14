const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

const Book = require("../models/Book");

// --- Configuration & Directory Setup ---
const uploadDirectory = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// --- Multer Storage Configuration ---
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (_req, file, cb) => {
    // Generate a unique filename using timestamp and UUID
    const filenameBase = `${Date.now()}-${crypto.randomUUID()}`;
    const extension = path.extname(file.originalname).toLowerCase() || ".pdf";
    cb(null, `${filenameBase}${extension}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const isPdf = file.mimetype === "application/pdf";
    if (!isPdf) {
      return cb(new Error("Only PDF files are allowed"));
    }
    cb(null, true);
  },
});

// --- Routes ---

/**
 * POST /add
 * Handles book creation with PDF upload and validation
 */
router.post("/add", (req, res) => {
  // Use multer middleware to handle the 'pdf' field
  upload.single("pdf")(req, res, async (uploadError) => {
    if (uploadError) {
      return res.status(400).json({ message: uploadError.message });
    }

    try {
      const { title, author } = req.body;

      // 1. Basic Validation
      if (!title || !author) {
        return res.status(400).json({ message: "Title and author are required" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "PDF file is required" });
      }

      // 2. Security: Path Traversal Check
      const resolvedUploadPath = path.resolve(req.file.path);
      const resolvedUploadDirectory = `${path.resolve(uploadDirectory)}${path.sep}`;
      if (!resolvedUploadPath.startsWith(resolvedUploadDirectory)) {
        return res.status(400).json({ message: "Invalid upload path" });
      }

      // 3. Deep File Validation: Check Magic Numbers (%PDF-)
      const headerBuffer = Buffer.alloc(5);
      const uploadedFileHandle = await fs.promises.open(resolvedUploadPath, "r");
      try {
        await uploadedFileHandle.read(headerBuffer, 0, 5, 0);
      } finally {
        await uploadedFileHandle.close();
      }

      const fileHeader = headerBuffer.toString();
      if (fileHeader !== "%PDF-") {
        // Clean up invalid file
        await fs.promises.unlink(resolvedUploadPath).catch(() => {});
        return res.status(400).json({ message: "Uploaded file content is not a valid PDF" });
      }

      // 4. Database Persistence
      const book = new Book({
        title,
        author,
        pdfUrl: `/uploads/${req.file.filename}`,
      });

      await book.save();
      res.status(201).json(book);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
});

/**
 * GET /
 * Retrieves all books
 */
router.get("/", async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;