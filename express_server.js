const express = require("express");
const app = express();
const PORT = 8082; // default port 8080
const cookieParser = require('cookie-parser');
const { restart } = require("nodemon");

app.set("view engine", "ejs");

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {

};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.post("/register", (req, res) => {
  randomID = generateRandomString();
  if (req.body.password === "" || req.body.email === "" || checkIfEmailExists(req.body.email)) {
    res.sendStatus(400)
  } else {
    users[`${randomID}`] = {
      id: randomID,
      email: req.body.email,
      password: req.body.password
    }
    res.cookie("user_id", randomID);
    res.redirect("/urls");
  }
})

app.get("/login", (req, res) => {
  const templateVars = { username: users[req.cookies["user_id"]] }
  res.render("urls_login", templateVars)
})

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: users[req.cookies["user_id"]] }
  res.render("urls_index", templateVars)
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
})

app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.redirect("/login")
  }

  const templateVars = { username: users[req.cookies["user_id"]] }
  res.render("urls_new", templateVars);
})


app.post("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.sendStatus(404);
  }

  const randomKey = generateRandomString()
  urlDatabase[randomKey] = { longURL: req.body.longURL, userID: req.cookies["user_id"] }
  console.log(urlDatabase)
  res.redirect(`/urls/${randomKey}`)
});

app.post("/login", (req, res) => {
  const emailExists = checkIfEmailExists(req.body.login)
  if (!emailExists) {
    return res.sendStatus(403)
  }
  if (emailExists) {
    if (req.body.password === users[emailExists].password) {
      res.cookie("user_id", users[emailExists].id)
      return res.redirect("/urls")
    }
  }

  return res.sendStatus(403)
})

app.get("/register", (req, res) => {
  if (req.cookies["user_id"]) {
    return res.redirect("/urls")
  }

  const templateVars = { username: users[req.cookies["user_id"]] }
  res.render("urls_register", templateVars);
})

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, username: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id].longURL) {
    return res.send("That short URL does not exist")
  }

  const longURL = urlDatabase[req.params.id].longURL
  res.redirect(longURL);
});


app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL
  res.redirect("/urls")
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls")
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/urls")
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const generateRandomString = () => {
  let result = "";
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result
}

const checkIfEmailExists = (email) => {
  for (const user in users) {
    if (users[user]["email"] === email) {
      return user;
    }
  }
  return null;
}