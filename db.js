const sqlite3 = require("sqlite3").verbose(); // imports the sqlite3 with verbose() logging enabled
const bcrypt = require("bcrypt");// imports bcrypt library used for hashing and verifying passwords

const db = new sqlite3.Database('users.db')

db.serialize(() =>{
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL

        )`);
});

function addUser(username, password, callback) {
    const hashedPw = bcrypt.hashSync(password, 10) // 10 salt rounds
    db.run('INSERT INTO users  (username,password_hash) VALUES(?,?)', [username, hashedPw], function(err){
        if (err) {
            if(err.message.includes('UNIQUE')) {
                callback(new Error('User already exists'))
            } else {
                callback(err);
            }
        }else {
            callback(null, `User ${username} Added!`)
        }
    });
} 

function verifyUser(username, password, callback) {
    db.get('SELECT password_hash FROM users WHERE username= ?',[username], (err, row)=> {
        if (err || !row) {
            callback(false);
        } else {
            callback(bcrypt.compareSync(password, row.password_hash));
        }
    });
}

module.exports = {addUser, verifyUser, db};