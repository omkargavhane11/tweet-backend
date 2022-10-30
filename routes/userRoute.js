import express from "express";
const router = express.Router();
import dotenv from "dotenv";
import User from "../models/User.js";
import multer from "multer";
import crypto from "crypto";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { appendFile } from "fs";

dotenv.config(); // getting access to files in ".env" folder

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


router.post("/login", async (req, res) => {
    try {

        const findEmail = await User.findOne({ contact: req.body.email });

        if (findEmail) {
            if (findEmail.password === req.body.password) {
                const { password, ...others } = findEmail._doc;
                res.send({ msg: "success", user: others })
            } else {
                res.send({ msg: "Invalid credentials" });
            }
        } else {
            res.send({ msg: "User not found" });
        }
    } catch (error) {
        res.send({ error: error.message });
    }

})

// user
router.post("/register", async (req, res) => {
    try {
        const findUser = await User.findOne({ email: req.body.email });

        if (!findUser) {
            const newUser = await User.create(req.body);
            res.send({ msg: "success" })
        } else {
            res.send({ msg: "failed", reason: "User already registered with the same contact number" })
        }
    } catch (error) {
        res.send({ msg: error.message });
    }
})

// get all users
router.get("/", async (req, res) => {
    try {
        const getAll = await User.find({}, { password: 0 });
        res.send(getAll)
    } catch (error) {
        res.send({ msg: error });
    }
})

// get user by ID
router.get("/:id", async (req, res) => {
    try {
        const getUser = await User.findOne({ _id: req.params.id }, { password: 0 });
        res.send(getUser)
    } catch (error) {
        res.send(error);
    }
})

// get user by ID
router.get("/search/:userName", async (req, res) => {
    try {
        let input_from_user = req.params.userName;
        let all_users = await User.find({}, { password: 0 });

        function find_user_with_keyword(input, db) {
            let small = input.toLowerCase().split(" ").join("");
            let big = db.toLowerCase().split(" ").join("");

            if (big.includes(small)) {
                return true;
            } else {
                return false;
            }
        }

        let users = [];

        for (let i = 0; i < all_users.length; i++) {

            let current_username = all_users[i].name;

            let found_keyword = find_user_with_keyword(input_from_user, current_username);

            if (found_keyword) {
                users.push(all_users[i]);
            }

        }

        res.send(users);
    } catch (error) {
        res.send(error);
    }
})



// edit user details by ID
// router.put("/:id", async (req, res) => {
//     try {
//         const getUser = await User.updateOne({ _id: req.params.id }, { $set: req.body });

//         if (getUser.modifiedCount === 1) {
//             res.send("Updated successfully")
//         } else {
//             res.send("Failed to updated user details")
//         }
//     } catch (error) {
//         res.send({ msg: error });
//     }
// })

router.put("/editProfile/:userId", upload.single('dp'), async (req, res) => {
    const name = req.body.name;

    try {
        const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');
        const uniqueFileName = generateFileName();


        if (req.file) {
            const params = {
                Bucket: bucketName,
                Key: uniqueFileName,
                Body: req.file.buffer,
                ContentType: req.file.mimetype
            }

            const command = new PutObjectCommand(params);
            await s3Client.send(command);

            const newData = {
                dp: `https://${bucketName}.s3.amazonaws.com/${uniqueFileName}`,
                name
            }
            const update = await User.updateOne({ _id: req.params.userId }, {
                $set: newData
            });

            // if (update.modifiedCount === 1) {
            //     const getUser = await User.findOne({ _id: req.params.id });
            //     res.send({ msg: "profile updated 1" });
            // } else {
            //     res.send({ msg: "profile not updated 1" });
            // }

            res.send({ msg: "profile updated", data: newData });


        } else {
            const update = await User.updateOne({ _id: req.params.userId }, {
                $set: req.body
            });
            // if (update.modifiedCount === 1) {
            //     const getUser = await User.findOne({ _id: req.params.id });
            //     res.send({ msg: "profile updated" });
            // } else {
            //     res.send({ msg: "profile not updated" });
            // }

            res.send({ msg: "profile updated", data: update });

        }
    } catch (error) {
        res.send({ msg: "profile not updated 3", error: error.message });
    }


    // if (req.file) {
    //     console.log(true)
    // } else {
    //     console.log(false)
    // }
    // console.log(req.body)
})


// follow - unfollow user   
router.put("/handleFollow/:type", async (req, res) => {
    try {
        let type = req.params.type;
        let friendId = req.body.friendId;
        let userId = req.body.userId;

        if (type === "Follow") {
            const updateFriendData = await User.updateOne({ _id: friendId }, { $push: { followers: userId } });

            const updateUserData = await User.updateOne({ _id: userId }, { $push: { following: friendId } });

            // handleFollow.updatedCount === 1 ? res.send("follow success") : res.send("follow unsuccess");
            res.send("follow done")
        } else if (type === "Unfollow") {
            const updateFriendData = await User.updateOne({ _id: friendId }, { $pull: { followers: userId } });

            const updateUserData = await User.updateOne({ _id: userId }, { $pull: { following: friendId } });

            // handleFollow.updatedCount === 1 ? res.send("unfollow uccess") : res.send("unfollow unsuccess");
            res.send("unfollow done")

        }

    } catch (error) {
        res.send(error.message);
    }
})



export default router;