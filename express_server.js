const express = require('express')
const { checkIfEmailExists, urlsForUser, generateRandomString } = require('./helpers')
const app = express()
const PORT = 8082 // default port 8080
const bcrypt = require('bcryptjs')
const cookieSession = require('cookie-session')
const methodOverride = require('method-override')

app.set('view engine', 'ejs')

app.use(cookieSession({
  name: 'session',
  keys: ["qweiqwneoqwoieqqweok12", "213123asdomno"],

  maxAge: 24 * 60 * 60 * 1000
}))
app.use(express.urlencoded({ extended: true }))

const urlDatabase = {}
const users = {}

///////////////////////////////////////////////////////////////////////////////////
//POST REGISTER, CHECKS TO SEE IF EMAIL ALREADY EXISTS IF NOT CREATE A NEW ACCOUNT
///////////////////////////////////////////////////////////////////////////////////
app.post('/register', (req, res) => {
  const randomID = generateRandomString()
  if (req.body.password === '' || req.body.email === '' || checkIfEmailExists(req.body.email, users)) {
    return res.sendStatus(400)
  } else {
    users[`${randomID}`] = {
      id: randomID,
      email: req.body.email,
      hashedPassword: bcrypt.hashSync(req.body.password, 10)
    }
    req.session.user_id = randomID
    return res.redirect('/urls')
  }
})

app.get('/login', (req, res) => {
  const templateVars = { username: users[req.session.user_id] }
  return res.render('urls_login', templateVars)
})

app.get('/', (req, res) => {
  return res.redirect("/login")
})

///////////////////////////////////////////////////////////////
//HOME PAGE, IF USER DOES NOT HAVE A COOKIE REDIRECTS TO LOGIN
///////////////////////////////////////////////////////////////

app.get('/urls', (req, res) => {
  if (!req.session.user_id) {
    return res.redirect('/login')
  }

  const usersLinks = urlsForUser(urlDatabase, req.session.user_id)
  const templateVars = {
    urls: usersLinks,
    username: users[req.session.user_id]
  }
  return res.render('urls_index', templateVars)
})

app.get('/urls/new', (req, res) => {
  if (!req.session.user_id) {
    return res.redirect('/login')
  }

  const templateVars = { username: users[req.session.user_id] }
  return res.render('urls_new', templateVars)
})

/////////////////////////////////////////////////////////////////
//ADDS NEW SHORT URL, LONG URL, AND OWNER OF THE URL TO DATABASE
/////////////////////////////////////////////////////////////////

app.post('/urls', (req, res) => {
  if (!req.session.user_id) {
    return res.sendStatus(404)
  }

  const randomKey = generateRandomString()
  urlDatabase[randomKey] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  }
  console.log(urlDatabase)
  return res.redirect(`/urls/${randomKey}`)
})

////////////////////////////////////////////////////////////////////////////////////
//POST LOGIN, CHECKS TO SEE IF EMAIL EXISTS AND IF PASSWORD MATCHES HASHED PASSWORD
////////////////////////////////////////////////////////////////////////////////////

app.post('/login', (req, res) => {
  const emailExists = checkIfEmailExists(req.body.login, users)
  if (!emailExists) {
    return res.sendStatus(403)
  }
  if (emailExists) {
    if (bcrypt.compareSync(req.body.password, users[emailExists].hashedPassword)) {
      req.session.user_id = users[emailExists].id
      return res.redirect('/urls')
    }
  }

  return res.sendStatus(403)
})

app.get('/register', (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls')
  }

  const templateVars = { username: users[req.session.user_id] }
  return res.render('urls_register', templateVars)
})

app.get('/urls/:id', (req, res) => {
  if (!req.session.user_id) {
    return res.send('You are not logged in and can not view these urls')
  }

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    username: users[req.session.user_id]
  }
  return res.render('urls_show', templateVars)
})

app.get('/u/:id', (req, res) => {
  if (!urlDatabase[req.params.id].longURL) {
    return res.send('That short URL does not exist')
  }
  const longURL = urlDatabase[req.params.id].longURL
  return res.redirect(longURL)
})

app.post('/urls/:id', (req, res) => {
  if (!req.session.user_id) {
    return res.send('You are not authorized to do this action please log in first')
  }

  if (!Object.keys(urlDatabase).includes(req.params.id)) {
    return res.send('The requested ID does not exist')
  }

  const ownedUrls = urlsForUser(urlDatabase, req.session.user_id)
  if (!Object.keys(ownedUrls).includes(req.params.id)) {
    return res.send('You do not own this URL!')
  }

  urlDatabase[req.params.id] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  }

  console.log(urlDatabase)
  return res.redirect('/urls')
})

//////////////////////////////////////////////////////////////////////////////////////
//DELETES URLS THAT ARE NO LONGER NEEDED. ONLY ALLOWS THE USER WHO OWNS IT TO PERFORM
//////////////////////////////////////////////////////////////////////////////////////

app.post('/urls/:id/delete', (req, res) => {
  if (!req.session.user_id) {
    return res.send('You are not authorized to do this action please log in first')
  }

  if (!Object.keys(urlDatabase).includes(req.params.id)) {
    return res.send('The requested ID does not exist')
  }

  const ownedUrls = urlsForUser(urlDatabase, req.session.user_id)
  if (!Object.keys(ownedUrls).includes(req.params.id)) {
    return res.send('You do not own this URL!')
  }

  delete urlDatabase[req.params.id]
  return res.redirect('/urls')
})

///////////////////////////////////
//CLEARS COOKIES WHEN USER LOGSOUT 
///////////////////////////////////

app.post('/logout', (req, res) => {
  res.clearCookie('session')
  return res.redirect('/urls')
})

////////////////
//CREATE SERVER
////////////////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
})