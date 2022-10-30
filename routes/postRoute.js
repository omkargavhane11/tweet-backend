import express from "express";
const router = express.Router();
import Post from "../models/Post.js";
import multer from "multer";
import crypto from "crypto";
// AWS
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { appendFile } from "fs";
import User from "../models/User.js";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


const storage = multer.memoryStorage()
const upload = multer({ storage: storage })


// s3 bucket details
const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKeyId = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;


// connecting to s3 bucket
const s3Client = new S3Client({
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
    region: bucketRegion
})



// new post
router.post("/", upload.single('image'), async (req, res) => {
    try {

        if (req.file) {

            const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');
            const uniqueFileName = generateFileName();

            const params = {
                Bucket: bucketName,
                Key: uniqueFileName,
                Body: req.file.buffer,
                ContentType: req.file.mimetype
            }

            const command = new PutObjectCommand(params);
            await s3Client.send(command);


            const newPost = await Post.create({ ...req.body, media: `https://${bucketName}.s3.amazonaws.com/${uniqueFileName}` });
            res.send({ msg: "success", data: newPost });
        } else {
            const newPost = await (await Post.create(req.body)).populate("createdBy");
            res.send({ msg: "success", data: newPost });
        }
    } catch (error) {
        res.send({ msg: error.message });
    }
});


// get all posts
router.get("/", async (req, res) => {
    try {
        const allPosts = await Post.find().populate("createdBy", { _id: 1, name: 1 });
        res.send({ msg: "success", data: allPosts });
    } catch (error) {
        res.send({ msg: error.message });
    }
})


// get post of User for profile
router.get("/user/:id", async (req, res) => {
    try {
        const allPosts = await Post.find({ createdBy: req.params.id }).populate("createdBy", { _id: 1, name: 1, dp: 1 }).populate("comments").populate({ path: "comments", populate: { path: "commentBy", select: "name _id dp" } });
        res.send({ msg: "success", data: allPosts });
    } catch (error) {
        res.send({ msg: error.message });
    }
})


// get timeline posts
router.get('/timeline/:userId', async (req, res) => {
    try {
        const currentUser = await User.findById(req.params.userId);
        const currentUserPosts = await Post.find({ createdBy: currentUser._id }).populate("createdBy", { _id: 1, name: 1, dp: 1 }).populate("comments").populate({ path: "comments", populate: { path: "commentBy", select: "name _id dp" } });
        const friendPosts = await Promise.all(
            currentUser.following.map((friendId) => {
                return Post.find({ createdBy: friendId }).populate("createdBy", { _id: 1, name: 1, dp: 1 }).populate("comments").populate({ path: "comments", populate: { path: "commentBy", select: "name _id dp" } });
            })
        );
        res.send(currentUserPosts.concat(...friendPosts));
    } catch (err) {
        res.send(err.message);
    }
})


// get post by Id
router.get("/:id", async (req, res) => {
    try {
        const getPost = await Post.find({ _id: req.params.id }).populate("createdBy", { _id: 1, name: 1, dp: 1 }).populate("comments").populate({ path: "comments", populate: { path: "commentBy", select: "name _id dp" } });
        res.send({ msg: "success", data: getPost });
    } catch (error) {
        res.send({ msg: error.message });
    }
})


// update post by Id
router.put("/:id", async (req, res) => {
    try {
        const updatePost = await Post.updateOne({ _id: req.params.id }, { $set: req.body });
        if (updatePost.modifiedCount === 1) {
            res.send({ msg: "success", data: updatePost });
        } else {
            res.send({ msg: "failed" })
        }
    } catch (error) {
        res.send({ msg: error.message });
    }
})


// delete post by Id
router.delete("/:id", async (req, res) => {
    try {
        const deletePost = await Post.deleteOne({ _id: req.params.id });
        if (deletePost.deletedCount === 1) {
            res.send({ msg: "success" });
        } else {
            res.send({ msg: "failed" })
        }
    } catch (error) {
        res.send({ msg: error.message });
    }
})


// like / remove like 
router.put("/:type/:postId", async (req, res) => {
    try {
        if (req.params.type === "like") {
            const addLike = await Post.updateOne({ _id: req.params.postId }, { $push: { likes: req.body.userId } });
            res.send({ msg: "liked", data: addLike });
        } else if (req.params.type === "dislike") {
            const removeLike = await Post.updateOne({ _id: req.params.postId }, { $pull: { likes: req.body.userId } });
            res.send({ msg: "unliked", data: removeLike });
        }
    } catch (error) {
        res.send({ msg: error.message });
    }
})

// // commment
// router.put("/comment/:postId", async (req, res) => {
//     try {
//         const addComment = await Post.updateOne({ _id: req.params.postId }, { $push: { comment: req.body } });
//         res.send({ msg: "commented", data: addComment });
//     } catch (error) {
//         res.send({ msg: error.message });
//     }
// })


export default router;