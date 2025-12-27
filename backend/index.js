// Tip2Trip
import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import messageRoute from "./routes/message.route.js";
import { app, server } from "./socket/socket.js";
import path from "path";
 
// Load environment variables from default .env at project root
dotenv.config();


const PORT = process.env.PORT || 5000;

const __dirname = path.resolve();

//middlewares
app.set('trust proxy', 1);
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

// Configure CORS from env: URL can be a comma-separated list
const allowedOrigins = (process.env.URL || '').split(',').map(s => s.trim()).filter(Boolean);
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
};
app.use(cors(corsOptions));

// yha pr apni api ayengi
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute);


// Serve frontend only in production (if bundled together)
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, "/frontend/dist")));
    app.get("*", (req,res)=>{
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    });
}


server.listen(PORT, () => {
    connectDB();
    console.log(`Server listen at port ${PORT}`);
});