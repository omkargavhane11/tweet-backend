import mongoose from "mongoose";
const { Schema } = mongoose;
import Comment from "./Comment.js";

const postSchema = new mongoose.Schema({
    text: {
        type: String,
        default: null
    },
    media: {
        type: String,
        default: null
    },
    likes: {
        type: [Schema.Types.ObjectId],
        ref: "User",
        default: []
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: "Comment",
        default: {}
    }
    ],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}
    ,
    { timestamps: true }
);



export default mongoose.model("Post", postSchema);