const express = require("express");
const router = express.Router();
const multer = require("multer");
const connection = require("../config/db");
const path = require("path");
const fs = require("fs");

const imageDir = path.join(__dirname, "../public/images/news");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(imageDir)) {
      fs.mkdirSync(imageDir, { recursive: true });
    }
    cb(null, imageDir); 
  },
  filename: function (req, file, cb) {
    const title = req.body.NewsTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase().slice(0,10); 
    const extension = path.extname(file.originalname);
    cb(null, `${title}_${extension}`);
  },
});

const upload = multer({ storage });



router.post("/createnews", upload.single("img"), (req, res) => {
  const { NewsDate, NewsTitle, NewsInfo, NewsViews } = req.body;
  const NewsPhoto = req.file ? `/images/news/${req.file.filename}` : null; 

  console.log(NewsPhoto); 

  const query =
    "INSERT INTO newsdata (NewsDate, NewsTitle, NewsInfo, NewsPhoto, NewsViews) VALUES (?, ?, ?, ?, ?)";
  connection.query(
    query,
    [NewsDate, NewsTitle, NewsInfo, NewsPhoto, NewsViews],
    (err, data) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Failed to create news item", error: err });
      }
      return res.status(201).json({ message: "News created successfully" });
    }
  );
});



router.get("/getnews", (req, res) => {
  const query = "SELECT * FROM newsdata";
  connection.query(query, (err, data) => {
    if (err) return res.status(500).json({ message: "Error fetching news", error: err });
    return res.json(data);
  });
});



router.get("/getnews/:id", (req, res) => {
  const query = "SELECT * FROM newsdata WHERE NewsID=?";
  const newsId = req.params.id;
  connection.query(query, [newsId], (err, data) => {
    if (err) return res.status(500).json({ message: "Error fetching news item", error: err });
    return res.json(data[0]);
  });
});



router.delete("/deletenews/:id", (req, res) => {
  const id = req.params.id;

  // First, retrieve the news item to get the image path
  const selectQuery = "SELECT NewsPhoto FROM newsdata WHERE NewsID = ?";
  connection.query(selectQuery, [id], (err, data) => {
    if (err) return res.status(500).json({ message: "Error fetching news item", error: err });
    
    if (data.length === 0) {
      return res.status(404).json({ message: "News item not found" });
    }

    const imagePath = path.join(__dirname, "..", "public", data[0].NewsPhoto);
    
    // Delete the image file from the public folder if it exists
    if (fs.existsSync(imagePath)) {
      fs.unlink(imagePath, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error deleting image", error: err });
        }

        // Proceed with deleting the news item from the database
        const deleteQuery = "DELETE FROM newsdata WHERE NewsID = ?";
        connection.query(deleteQuery, [id], (err, data) => {
          if (err) return res.status(500).json({ message: "Error deleting news item", error: err });
          return res.json({ message: "News has been deleted" });
        });
      });
    } else {
      // If the image doesn't exist, just delete the news item
      const deleteQuery = "DELETE FROM newsdata WHERE NewsID = ?";
      connection.query(deleteQuery, [id], (err, data) => {
        if (err) return res.status(500).json({ message: "Error deleting news item", error: err });
        return res.json({ message: "News has been deleted" });
      });
    }
  });
});




router.patch('/editnews/:id', upload.single('NewsPhoto'), (req, res) => {
  const { NewsTitle, NewsInfo, NewsDate } = req.body;
  const newsId = req.params.id;
  let NewsPhoto = req.file ? `/images/news/${req.file.filename}` : null; 

  if (!NewsPhoto) {
    // If no new image is uploaded, retain the old image URL
    const selectQuery = "SELECT NewsPhoto FROM newsdata WHERE NewsID = ?";
    connection.query(selectQuery, [newsId], (err, data) => {
      if (err) return res.status(500).json({ message: "Error fetching news item", error: err });

      NewsPhoto = data[0].NewsPhoto; // Use the old image if no new image is uploaded

      // Update the news item
      const query = "UPDATE newsdata SET NewsTitle = ?, NewsInfo = ?, NewsDate = ?, NewsPhoto = ? WHERE NewsID = ?";
      connection.query(query, [NewsTitle, NewsInfo, NewsDate, NewsPhoto, newsId], (err, data) => {
        if (err) return res.status(500).json({ message: "Failed to update news", error: err });
        return res.status(200).json({ message: "News updated successfully" });
      });
    });
  } else {
    // If a new image is uploaded, delete the old image first

    const selectQuery = "SELECT NewsPhoto FROM newsdata WHERE NewsID = ?";
    connection.query(selectQuery, [newsId], (err, data) => {
      if (err) return res.status(500).json({ message: "Error fetching news item", error: err });

      // Get the old image path from the database
      const oldImagePath = path.join(__dirname, "..", "public", data[0].NewsPhoto);

      // Delete the old image file if it exists
      if (fs.existsSync(oldImagePath)) {
        fs.unlink(oldImagePath, (err) => {
          if (err) return res.status(500).json({ message: "Error deleting old image", error: err });

          // Proceed to update the news item with the new image
          const query = "UPDATE newsdata SET NewsTitle = ?, NewsInfo = ?, NewsDate = ?, NewsPhoto = ? WHERE NewsID = ?";
          connection.query(query, [NewsTitle, NewsInfo, NewsDate, NewsPhoto, newsId], (err, data) => {
            if (err) return res.status(500).json({ message: "Failed to update news", error: err });
            return res.status(200).json({ message: "News updated successfully" });
          });
        });
      } else {
        // If the old image doesn't exist, proceed to update without deleting the image
        const query = "UPDATE newsdata SET NewsTitle = ?, NewsInfo = ?, NewsDate = ?, NewsPhoto = ? WHERE NewsID = ?";
        connection.query(query, [NewsTitle, NewsInfo, NewsDate, NewsPhoto, newsId], (err, data) => {
          if (err) return res.status(500).json({ message: "Failed to update news", error: err });
          return res.status(200).json({ message: "News updated successfully" });
        });
      }
    });
  }
});



module.exports = router;