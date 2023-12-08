const express = require("express");
const router = express.Router();
const db = require("../config/database");

router.get("/login", (req,res) => {
    res.render("login" , {
        error: req.session.error,
    });
    req.session.error = null
});

router.post("/login", (req, res)=> {
    const{username, password} = req.body;

    const query = "SELECT * FROM users WHERE username = ? AND password = ?";
    db.query(query,[username, password], (err, result) => {
        if (err) throw err;

        console.log(username, password);

        if (result.length > 0){
            req.session.username = username;
            req.session.role = result[0].role;
            res.redirect("/");
        }else{
            req.session.error = "Invalid Username or Password";
            res.redirect("/login")
        }
    });
});

module.exports = router