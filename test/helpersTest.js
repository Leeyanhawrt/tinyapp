const { assert } = require('chai');

const { checkIfEmailExists } = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe("checkIfEmailExists", () => {
  it('Should return a user if a valid email exists', () => {
    const user = checkIfEmailExists("user@example.com", testUsers)
    const expectedUserID = "userRandomID"
    assert.equal(user, expectedUserID)
  })

  it('Should returned undefined if an email does not exist in the database', () => {
    const user = checkIfEmailExists("thiswillnotwork@example.com", testUsers)
    const expectedUserID = undefined
    assert.equal(user, expectedUserID)
  })
})
