var bodyParser = require("body-parser");
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const Auth = require("./authLogic");
const auth = new Auth();
const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use((req, res, next) => {
  console.log(req.method, req.url, new Date(), res.status);
  next();
});
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use(cors());
const delayMiddleware = (req, res, next) => {
  setTimeout(() => {
    next(); 
  }, 1000); 
};

app.use(delayMiddleware);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

app.get("/", (req, res) => {
  let data = [];
  data = res.send(data);
});
app.post(
  "/register",
  upload.fields([{ name: "image" }, { name: "cv" }]),

  async (req, res) => {
    console.log(req.body)
    if (!req.files || req.files.length <= 1) {
      return res.status(401).send("No files were uploaded.");
    }
    let registered;
    let pdfFile;
    let image;
    if (req.files.cv && req.files.image) {
      let pdfFile = req.files.cv[0];
      let image = req.files.image[0];
      const pdfPaths = `${req.protocol}://${req.get("host")}/uploads/${pdfFile.filename
        }`;
      const imagePaths = `${req.protocol}://${req.get("host")}/uploads/${image.filename
        }`;

      const user = { ...req.body, cv: pdfPaths, image: imagePaths };
      registered = await auth.register(user);
    } else {
      registered = await auth.register(req.body)
    }
    if (registered.ok) {

      res.status(200).send({
        ok: true,
        message: "Welcome , you have been registered successfully",
      });

    } else {
      if (image) {
        const imagePath = path.join(__dirname, "uploads", image.filename);
        fs.unlink(imagePath, (err) => {
          if (err) {
            return res.status(500).json("Error deleting file.");
          }
        });
      }
      if (pdfFile) {
        const pdfPath = path.join(__dirname, "uploads", pdfFile.filename);
        fs.unlink(pdfPath, (err) => {
          if (err) {
            return res.status(500).json("Error deleting file.");
          }
        });
      }

      res.status(402).send(registered);

    }
  }
);

app.post("/login", async (req, res) => {
  const user = await auth.login({
    email: req.body.email,
    password: req.body.password,
  });
  user.ok ? res.status(201).send(user) : res.status(401).send(user);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
