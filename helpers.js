const checkIfEmailExists = (email, database) => {
  for (const user in database) {
    if (database[user]["email"] === email) {
      return user;
    }
  }
  return null;
}

/////////////////////////////////////////////////////////////////////////////
//FUNCTION GENERATES RANDOM KEY THAT IS ALPHANUMERIC CONTAINING 6 CHARACTERS
/////////////////////////////////////////////////////////////////////////////

const generateRandomString = () => {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

///////////////////////////////////////////////////////////////////////
//CHECKS DATABASE TO SEE IF USER OWNS THE URL BASED OFF COOKIE SESSION 
///////////////////////////////////////////////////////////////////////

const urlsForUser = (database, id) => {
  const obj = {}
  for (const user in database) {
    if (database[user].userID === id) {
      obj[user] = database[user].longURL
    }
  }
  return obj
}

module.exports = {
  checkIfEmailExists,
  generateRandomString,
  urlsForUser
}