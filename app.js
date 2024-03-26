import express from "express";
import userRouter from "./src/resources/user/routes/user.routes.js"
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Welcome to Plug");
});

app.use('/api/v1/user', userRouter)

export default app;
