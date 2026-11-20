import mongoose from "mongoose";

let connectionPromise;

export const connectDatabase = async () => {
  const uri = (process.env.MONGODB_URI || process.env.MONGODB_URL)?.trim();
  if (!uri) {
    throw new Error("MONGODB_URI or MONGODB_URL is not configured");
  }

  if (mongoose.connection.readyState === 1) return mongoose;
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(uri).finally(() => {
      connectionPromise = undefined;
    });
  }
  return connectionPromise;
};
