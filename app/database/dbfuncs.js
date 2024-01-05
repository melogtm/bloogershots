import query from "./db.js";
import bcrypt from "bcrypt"; 

// Authentication Functions 
async function createUser(username, password) {
    // Generating Salt and Hashing Password - for security
    const salt = await bcrypt.genSalt(10); 

    const hash = await bcrypt.hash(password, salt); 

    const newUser = await query(
    "INSERT INTO users(username, pass) VALUES ($1, $2) RETURNING id, username, pass", [username, hash] 
    );

    // Returning new User
    if (newUser.rowCount === 0) return false; 
    return newUser.rows[0];
};

async function userAlreadyExists(username) {
    const isUser = await query("SELECT * FROM users WHERE username=$1", [username]); 

    if (isUser.rowCount === 0) return false; 
    return isUser.rows[0];
};

async function isPasswordCorrect(plainPass, databasePass) {
    const matched = await bcrypt.compare(plainPass, databasePass); 
    return matched; 
};


export {
    createUser,
    userAlreadyExists, 
    isPasswordCorrect
}; 