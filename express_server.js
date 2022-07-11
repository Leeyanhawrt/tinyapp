const express = require("express");
const app = express();
const PORT = 8081; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/b2xVn2", (req, res) => {
  res.send(`${urlDatabase.b2xVn2}`)
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});