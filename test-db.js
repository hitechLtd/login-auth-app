const {addUSer} = require("./db");
addUSer('testuser', 'password123', (err, msg)=>{
    if (err) console.error(err.message);
    else console.log(msg);
})