import express from "express";
import morgan from "morgan";
import userRouter from "./src/resources/user/routes/user.routes.js"
const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Welcome to Plug");
});

app.use('/api/v1/user', userRouter)

export default app;
