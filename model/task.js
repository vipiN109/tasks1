const mongoose= require('mongoose')

const task_schema = new mongoose.Schema({
    task:{
        type: Number,
        default:1
    },
    ownerId:{
        type:mongoose.Types.ObjectId
    },
    assignedby: {
        type: mongoose.Types.ObjectId
    },
    parentId:{
        type:mongoose.Types.ObjectId
    }
})

const task_model= mongoose.model('tasks',task_schema)
module.exports= task_model