import app from "./src/app.js";
import dotenv from "dotenv";
import logger from "./src/utils/log/logger.js";
import connectDB from "./src/database/db.js";
import artisanRoute from "./src/resources/artisan/routes/artisan.routes.js";
import path from 'path';
app.use("/api/v1",artisanRoute);

const port = process.env.PORT || 3456;
dotenv.config();

const server = app.listen(port, async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log(`Database connected successfully`);
    logger.info(`Server is running on http://localhost:${port}`);
  } catch (error) {
    logger.error(error);
  }
});
