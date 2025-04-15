const mongoose = require("mongoose");

//Defining user mongodb schema

const UserSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password:{
        type: String,
        required: true,
    },
    profileImageUrl:{
        type:String,
        default: null
    },
    repayableBalance: {
        type: Number,
        default: 0
      },
      
    role:{
        type: String,
        enum: ['admin', 'user'],
        default: "user"
    }
}, 
{timestamps: true}
);

module.exports = mongoose.model('User', UserSchema)
