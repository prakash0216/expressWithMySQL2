const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');

const express=require("express");
const app=express();

app.set("view engine","ejs");
const path=require("path");
app.set("views",path.join(__dirname,"/views"));

const methodOverride=require("method-override");
app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));

const { v4: uuidv4 } = require('uuid');

let port=3000;

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'test',
    password: 'password',
  });

let getRandomUser=()=> {
    return [
        faker.string.uuid(),
        faker.internet.userName(),
        faker.internet.email(),
        faker.internet.password(),
    ]
};

//inserting new data
// let q="INSERT INTO user(id,username,email,password) VALUES ?";

// let data=[];
// for(let i=1;i<=100;i++){
//     data.push(getRandomUser());
// }

app.listen("3000",()=>{
    console.log("server is listening");
});

app.get("/",(req,res)=>{
    let q=`SELECT count(*) FROM user`;
    try{
        connection.query(q,(err,result)=>{
        let count =result[0]["count(*)"];
        res.render("home.ejs",{count});
    });
    }catch(err){
        console.log(err);
        res.send("some error in database");
    }
});

app.get("/user",(req,res)=>{
    let q=`select id ,username,email from user`;
    try{
        connection.query(q,(err,users)=>{
        // console.log(users);
        res.render("showusers.ejs",{users});
    });
    }catch(err){
        console.log(err);
        res.send("some error in database");
    }
})

//edit
app.get("/user/:id/edit",(req,res)=>{
    let{id}=req.params;
    let q=`SELECT * FROM user WHERE id='${id}'`;
    try{
        connection.query(q,(err,result)=>{
        // console.log(users);
        let user=result[0];
        res.render("edit.ejs",{user});
    });
    }catch(err){
        console.log(err);
        res.send("some error in database");
    }
})


//patch
app.patch("/user/:id",(req,res)=>{
    let{id}=req.params;
    let{password: formPassword,username:newUsername}=req.body;
    let q=`SELECT * FROM user WHERE id='${id}'`;
    try{
        connection.query(q,(err,result)=>{
        // console.log(users);
        let user=result[0];
        if(formPassword!=user.password){
            res.send("WRONG password");
        }else{
            let q2=`UPDATE user SET username='${newUsername}' WHERE id='${id}'`;
            connection.query(q2,(err,result)=>{
                if(err) throw err;
                res.redirect("/user");
            })
        }
    });
    }catch(err){
        console.log(err);
        res.send("some error in database");
    }
})


//add
app.get("/user/new",(req,res)=>{
    res.render("new.ejs")
})

app.post("/user/new",(req,res)=>{
    let id=uuidv4();
    let{username,email,password}=req.body;
    try{
        let q = `INSERT INTO user (id, username, email, password) VALUES ('${id}','${username}','${email}','${password}') `;
        connection.query(q,(err,result)=>{
            console.log("added new user");
            res.redirect("/user");
        });
    }catch{
        console.log(err);
        res.send("some error in database");
    }
});

//delete
app.get("/user/:id/delete", (req, res) => {
    let { id } = req.params;
    let q = `SELECT * FROM user WHERE id='${id}'`;
  
    try {
      connection.query(q, (err, result) => {
        if (err) throw err;
        let user = result[0];
        res.render("delete.ejs", { user });
      });
    } catch (err) {
      res.send("some error with DB");
    }
  });

  
app.delete("/user/:id/", (req, res) => {
    let { id } = req.params;
    let { password } = req.body;
    let q = `SELECT * FROM user WHERE id='${id}'`;
  
    try {
      connection.query(q, (err, result) => {
        if (err) throw err;
        let user = result[0];
  
        if (user.password != password) {
          res.send("WRONG Password entered!");
        } else {
          let q2 = `DELETE FROM user WHERE id='${id}'`; //Query to Delete
          connection.query(q2, (err, result) => {
            if (err) throw err;
            else {
              console.log(result);
              console.log("deleted!");
              res.redirect("/user");
            }
          });
        }
      });
    } catch (err) {
      res.send("some error with DB");
    }
  });

// try{
//     connection.query(q,[data],(err,result)=>{
//         console.log(result);
//     });
// }catch(err){
//     console.log(err);
// }

// connection.end();
