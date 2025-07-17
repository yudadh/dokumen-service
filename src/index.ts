import express, { Request, Response } from "express";
import { logger } from "./utils/logger";
import cors from "cors";
import router from "./routes/dokumenRoutes";
import { errorHandler } from "./middleware/error";
import cookieParser from "cookie-parser"
import morgan from "morgan";

const app = express();

const corsOptions = {
   origin: process.env.FRONTEND_URL, // Origin frontend Anda
   credentials: true, // Mengizinkan pengiriman cookie/credentials
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser())
app.use(morgan('common'))
app.use("/dokumen", router)


app.get("/", (req: Request, res: Response) => {
   logger.info("someone requested at /");
   res.send("hello from dokumen-service");
   
});

app.use(errorHandler)

export default app
