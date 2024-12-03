const express = require("express");
const router = new express.Router();
const connection = require("../config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const imageDir = path.join(__dirname, "../public/images/team");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(imageDir)) {
      fs.mkdirSync(imageDir, { recursive: true });
    }
    cb(null, imageDir);
  },
  filename: function (req, file, cb) {
    const title = req.body.TestimName.replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()
      .split(" ")[0];
    const extension = path.extname(file.originalname);
    cb(null, `${title}_${extension}`);
  },
});

const upload = multer({ storage });



router.post("/createteam", upload.single("img"), (req, res) => {
  const { TestimDate, TestimName, TestimInfo, TestimProfile } = req.body;
  const TestimPhoto = req.file ? `/images/team/${req.file.filename}` : null;
  const que =
    "INSERT INTO testimonials (TestimDate, TestimName,TestimInfo, TestimPhoto, TestimProfile) VALUES (?, ?, ?,?,?)";

  connection.query(
    que,
    [TestimDate, TestimName, TestimInfo, TestimPhoto, TestimProfile],
    (err, data) => {
      if (err) return res.json(err);
      return res.json("Member added successfuly");
    }
  );
});



router.get("/getteam", (req, res) => {
  const que = "SELECT * FROM testimonials";
  connection.query(que, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});



router.get("/getteam/:id", (req, res) => {
  const que = "SELECT * FROM testimonials WHERE TestimID=?";
  const id = req.params.id;
  connection.query(que, [id], (err, data) => {
    if (err) return res.json(err);
    return res.json(data[0]);
  });
});



router.delete("/deleteteam/:id", (req, res) => {
  const id = req.params.id;

  const selectQuery = "SELECT TestimPhoto FROM testimonials WHERE TestimID=?";
  connection.query(selectQuery, [id], (err, data) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Error fetching Team members", error: err });
    if (data.length === 0) {
      return res.status(404).json({ message: "Not found" });
    }
    let imagePath = null;

    if (data[0]?.TestimPhoto) {
      imagePath = path.join(__dirname, "..", "public", data[0].TestimPhoto);
    }
    

    if (fs.existsSync(imagePath)) {
      fs.unlink(imagePath, (err) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Error deleting image", error: err });
        }

        const deleteQuery = "DELETE FROM testimonials WHERE TestimID = ?";
        connection.query(deleteQuery, [id], (err, data) => {
          if (err) return res.status(500).json("Error");
          return res.json("Deleted successfully");
        });
      });
    } else {
      const deleteQuery = "DELETE FROM testimonials WHERE TestimID = ? ";
      connection.query(deleteQuery, [id], (err, data) => {
        if (err) return res.status(500).json("Error deleting Testimonial");
      });
    }
  });
});




router.patch("/editteam/:id", upload.single("TestimPhoto"), (req, res) => {
  const { TestimDate, TestimName, TestimInfo, TestimProfile } = req.body;
  const id = req.params.id;
  const newImage = req.file ? `/images/team/${req.file.filename}` : null;

  const selectQuery = "SELECT TestimPhoto FROM testimonials WHERE TestimID = ?";
  connection.query(selectQuery, [id], (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching testimonial", error: err });
    }

    const oldImagePath = data[0]?.TestimPhoto
      ? path.join(__dirname, "..", "public", data[0].TestimPhoto)
      : null;
    const imageToUpdate = newImage || data[0]?.TestimPhoto;

    const updateQuery =
      "UPDATE testimonials SET TestimDate=?, TestimName=?, TestimPhoto=?, TestimInfo=?, TestimProfile=? WHERE TestimID=?";
    const updateValues = [TestimDate, TestimName, imageToUpdate, TestimInfo, TestimProfile, id];

    const updateDatabase = () => {
      connection.query(updateQuery, updateValues, (err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to update testimonial", error: err });
        }
        res.status(200).json({ message: "Testimonial updated successfully" });
      });
    };

    // Delete old image if a new one is uploaded
    if (newImage && oldImagePath && fs.existsSync(oldImagePath)) {
      fs.unlink(oldImagePath, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error deleting old image", error: err });
        }
        updateDatabase();
      });
    } else {
      updateDatabase();
    }
  });
});



module.exports = router;