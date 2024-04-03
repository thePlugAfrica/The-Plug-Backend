import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB from "./src/database/db.js";

dotenv.config(); 

const PORT = process.env.PORT || 2000;


const server = app.listen(PORT, async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    console.log(`Database connected successfully`);
    console.log(`Server is running on port http://localhost:${PORT}`);
  } catch (error) {
    console.log(error);
  }
});