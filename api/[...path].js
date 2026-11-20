import app from "../backend/app.js";
import { connectDatabase } from "../backend/config/database.js";

export default async function handler(req, res) {
  try {
    await connectDatabase();
    return app(req, res);
  } catch (error) {
    console.error("API request could not connect to MongoDB:", error.message);
    return res.status(500).json({ error: "The database is unavailable" });
  }
}
