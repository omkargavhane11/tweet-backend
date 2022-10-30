import express from 'express';
import mongoose from 'mongoose';
import dotenv from "dotenv";
import cors from "cors";
// routes
import userRouter from "./routes/userRoute.js";
import postRouter from "./routes/postRoute.js";
import commentRouter from "./routes/commentRoute.js";
import authRouter from "./routes/authRoute.js";

dotenv.config(); // getting access to files in ".env" folder
const app = express();
const PORT = process.env.PORT;


// connecting to mongoDB
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, () => console.log("mongodb connected ✅"));

// middlewares
app.use(express.json());
app.use(cors({
    origin: "https://mytweet.netlify.app" || "http://localhost:8800"
}));
// app.use(express.urlencoded({ extended: true }));


app.get("/", (req, res) => {
    res.send("tweet API")
})

// routes
app.use("/user", userRouter);
app.use("/post", postRouter);
app.use("/comment", commentRouter);
app.use("/auth", authRouter);

app.listen(PORT, () => console.log('tweet api server listening on port ' + PORT));
