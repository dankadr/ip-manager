const User = require('./models/User');

const username = "admin";
const password = "123456";
// leave this field as true;
const isAdmin = true;

try {
    addUser(username, password, true)   
} catch (error) {
    console.log("Error: unable to create user", error);
}