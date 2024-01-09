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

async function getUserById(id) {
    const userById = await query("SELECT * FROM users WHERE id = $1", [id]);

    return userById.rows[0]; 
};

// Posts Functions 
async function createPost(post_info) {
    const post = await query(
        "INSERT INTO posts(user_id, post_text, date) VALUES ($1, $2, $3) RETURNING post_id, user_id, post_text, date", 
        [post_info.user, post_info.thought, post_info.post_date]
    ); 

    if (post.rowCount === 0) return false;
    return post.rows[0]; 
};

async function listPosts() {
    // ORDER BY date DESC - Newest posts first. 
    const posts = await query("SELECT * FROM posts ORDER BY date DESC"); 

    if (posts.rowCount === 0) return []; 
    return posts.rows; 
};

async function deletePost(id, user_id) {
    const post = (await query("SELECT * FROM posts WHERE post_id = $1", [id])).rows[0];

    if (post.user_id == user_id) {
        const deletedPost = await query("DELETE FROM posts WHERE post_id = $1 RETURNING *", [id]);
        
        if (deletedPost.rowCount === 0) return []; 
        
        return deletedPost.rows; 
    } else {
        return false; 
    };
};

export {
    createUser,
    userAlreadyExists, 
    isPasswordCorrect,
    getUserById,
    listPosts,
    createPost,
    deletePost
}; 