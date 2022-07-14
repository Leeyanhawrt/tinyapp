const express = require("express");
const app = express();
const PORT = 8082; // default port 8080
const cookieParser = require('cookie-parser');
const { restart } = require("nodemon");
const bcrypt = require('bcryptjs');


app.set("view engine", "ejs");

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  K3cKsG: { longURL: 'https://www.google.com', userID: 'a59Hco' },
  K3cKsE: { longURL: 'https://www.google.com', userID: 'a59Hco' },
  K3cKsC: { longURL: 'https://www.google.com', userID: 'a59Hco' }
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
      hashedPassword: bcrypt.hashSync(req.body.password, 10)
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
  if (!req.cookies["user_id"]) {
    return res.redirect("/login")
  }

  const usersLinks = urlsForUser(urlDatabase, req.cookies["user_id"])
  const templateVars = { urls: usersLinks, username: users[req.cookies["user_id"]] }
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
  res.redirect(`/urls/${randomKey}`)
});

app.post("/login", (req, res) => {
  const emailExists = checkIfEmailExists(req.body.login)
  if (!emailExists) {
    return res.sendStatus(403)
  }
  if (emailExists) {
    if (bcrypt.compareSync(req.body.password, users[emailExists].hashedPassword)) {
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
  if (!req.cookies["user_id"]) {
    res.send("You are not logged in and can not view these urls")
  }

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
  if (!req.cookies["user_id"]) {
    return res.send("You are not authorized to do this action please log in first")
  }

  if (!Object.keys(urlDatabase).includes(req.params.id)) {
    return res.send("The requested ID does not exist")
  }

  const ownedUrls = urlsForUser(urlDatabase, req.cookies["user_id"])
  if (!ownedUrls.includes(req.params.id)) {
    return res.send("You do not own this URL!")
  }

  urlDatabase[req.params.id] = req.body.longURL
  return res.redirect("/urls")
});

app.post("/urls/:id/delete", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.send("You are not authorized to do this action please log in first")
  }

  if (!Object.keys(urlDatabase).includes(req.params.id)) {
    return res.send("The requested ID does not exist")
  }

  const ownedUrls = urlsForUser(urlDatabase, req.cookies["user_id"])
  if (!Object.keys(ownedUrls).includes(req.params.id)) {
    return res.send("You do not own this URL!")
  }

  delete urlDatabase[req.params.id];
  return res.redirect("/urls")
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

const urlsForUser = (database, id) => {
  const obj = {}
  for (const user in database) {
    if (database[user].userID === id) {
      obj[user] = database[user].longURL
    }
  }
  return obj
}

