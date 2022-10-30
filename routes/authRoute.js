import express from "express";
const router = express.Router();
import User from "../models/User.js";

router.post("/", async (req, res) => {
    try {
        const findEmail = await User.findOne({ email: req.body.email });

        if (findEmail) {
            if (findEmail.password === req.body.password) {
                const { password, ...others } = findEmail._doc;
                res.send({ msg: "success", user: others })
            } else {
                res.send({ msg: "Invalid credentials" });
            }
        } else {
            res.send({ msg: "Invalid credentials" });
        }
    } catch (error) {
        res.send({ error: error.message });
    }

})


export default router;
