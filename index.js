require('dotenv').config(); 
const express = require('express');
const app = express()
const bcrypt = require('bcrypt')
const { UserModel, TodoModel } = require('./db.js')
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const port = process.env.PORT || 5000;
const dbUrl = process.env.DB_URL;
const JWT_SECRET = process.env.MY_SECRET_KEY;

mongoose.connect(dbUrl);

app.use(express.json());

app.post("/signup", async function(req, res) {
    try{
    const { email, password, name } = req.body;

    if(!email || !password || !name){
        return res.status(400).json({
            message: "all fields are required"
        })
    }

    const existingUser = await UserModel.findOne({ email });
    if(existingUser){
       return res.json({
            message: "User already exists"
        })
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await UserModel.create({
        email: email,
        password: hashedPassword,
        name: name
    });
    
    res.json({
        message: "You are signed up"
    })
    } catch(err) {
        res.status(500).json({
            message: `something went wrong => ${err}`
        })
    }
});

app.post('/signin', async(req, res) => {
    try{
    const { email, password } = req.body;

    if(!email || !password ){
        return res.status(400).json({
            message: "all fields are required"
        })
    }

    const user = await UserModel.findOne({ email: email })

    const isValidPassword = await bcrypt.compare(password, user.password);

    if(user && isValidPassword === true){
        const token = jwt.sign({
            id: user._id
        }, JWT_SECRET)
        res.json({
            message: "you are logged in",
            token: token
        })
    }else{
        return res.status(403).json({
            message: "wrong credentials"
        })
    }
    }catch(err) {
        res.json({message: `something went wrong => ${err}`})
    }
})

app.post('/todo', async(req, res) => {
    try{
    const token = req.headers.token;
    const title = req.body.title;
    const description = req.body.description;

    console.log(token);

    if(token === undefined) {
        return res.json({ message: `authorization token missing` })
    }

    if(!title) {
        return res.json({ message: `Cmon man how can you add a todo without a fucking title` })
    }

    const isUser = jwt.verify(token, JWT_SECRET)
    console.log(isUser)
    if(isUser){
        await TodoModel.create({
            userId: isUser.id,
            title: title,
            description: description,
            done: false
        })
    
        res.json({
            message: "todo added successfully"
    
        })
    } else {
        return res.status(404).json({
            message: "authorization token not found"
        })
    }
} catch (err){
    res.json({
        message: `something went wrong => ${err}`
    })
}
})

app.get('/todos', async(req,res)=> {
    const token = req.headers.token;
    const isUser = jwt.verify(token, JWT_SECRET);
    const todos = await TodoModel.find({
        userId: isUser.id
    })

    const formatedTodo = todos.map(todo=> ({
        title: todo.title,
        description: todo.description,
        done: todo.done ? "done" : "not done yet"
    }));

    res.json({
        message:formatedTodo
    })
})

app.listen(port, ()=> console.log("server is running at http://localhost:3000"))
