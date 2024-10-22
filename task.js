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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use((req, res, next) => {
  console.log(req.method, req.url, new Date(), res.status);
  next();
});
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use(cors());

let owners = [];
let animals = [];
app.post("/api/owner", async (req, res) => {
  owners.push({ ...req.body, id: owners.length + 1 });

  res.json(owners[owners.length - 1]);
});

app.post("/api/animal/:owner_id", async (req, res) => {
  animals.push({ ...req.body, id: animals.length + 1 , owner_id : req.params.owner_id});

  res.json( animals[animals.length - 1]);
});

app.get("/api/animals/list/:owner_id",  (req, res) => {
  res.json(animals.filter((animal) => animal.owner_id == req.params.owner_id));
});

app.patch("/api/animal/:animal_id", async (req, res) => {
  const animal = animals.find((animal) => animal.id == req.params.animal_id);
  console.log(animal);
  console.log(animals); 
  if (animal) {
    Object.assign(animal, req.body);
    res.json(animal);
  } else {
    res.status(404).send("Animal not found");
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
 