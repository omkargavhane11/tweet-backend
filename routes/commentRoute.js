import express from "express";
const router = express.Router();
import Post from "../models/Post.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";

// create comment
router.post("/new/:postId", async (req, res) => {
    try {
        const newComment = await (await Comment.create(req.body)).populate("commentBy");

        const add_comment_to_post = await Post.updateOne({ _id: req.params.postId }, { $push: { comments: newComment._id } });

        if (add_comment_to_post.modifiedCount === 1) {
            res.send({ msg: "success", data: newComment });
        } else {
            res.send({ msg: "unsuccess" });
        }

    } catch (error) {
        res.send({ msg: error.message });
    }
})


// comments by post 
router.get("/:postId", async (req, res) => {
    try {
        const comments = await Comment.find({ postId: req.params.postId });
        res.send({ msg: "success", data: comments })
    } catch (error) {
        res.send({ msg: error.message });
    }
})

// delete comment
router.delete("/:commentId", async (req, res) => {
    try {
        const deleteComment = awaitComment.deleteOne({ _id: req.params.commentId });
        if (deleteComment.deletedCuont === 1) {
            res.send({ msg: "success" });
        } else {
            res.send({ msg: "failure" });
        }
    } catch (error) {
        res.send({ msg: error.message });
    }
})






export default router;
