const mongoose = require('mongoose')

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const User = new Schema({
    email: String,
    password: String,
    name: String
});

const todo = new Schema({
    title: String,
    done: Boolean,
    userId: ObjectId,
    description: String,
    currentTime: { type: Date, default: Date.now },
    finishBy: String
});

const UserModel = mongoose.model("users", User);
const TodoModel = mongoose.model("todos", todo);

module.exports = {
    UserModel: UserModel,
    TodoModel: TodoModel
}