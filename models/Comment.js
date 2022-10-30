import mongoose from "mongoose";
const { Schema } = mongoose;

const commentSchema = new mongoose.Schema({
    comment: {
        type: String,
        required: true
    },
    commentBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    postId: {
        type: Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },
    likes: {
        type: [Schema.Types.ObjectId],
        ref: "User",
        default: []
    },
}
    ,
    { timestamps: true }
);



export default mongoose.model("Comment", commentSchema);