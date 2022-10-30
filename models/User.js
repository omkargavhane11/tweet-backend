import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 3,
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    followers: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
        default: null
    },
    following: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
        default: null
    },
    dp: {
        type: String,
        default: null
    }
}
    ,
    { timestamps: true }
);



export default mongoose.model("User", userSchema);