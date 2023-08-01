const mongoose= require('mongoose')

const user_schema= new mongoose.Schema({
    user_name:{
        type:String
    }
})

const user_model= mongoose.model('user',user_schema)
module.exports= user_model;