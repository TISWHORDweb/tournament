import mongoose from "mongoose";

const globalForMongoose = globalThis as unknown as {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

export async function connectDB() {
  if (globalForMongoose.conn) return globalForMongoose.conn;

  const uri = process.env.DATABASE_URL;
  if (!uri) throw new Error("DATABASE_URL environment variable is not set");

  if (!globalForMongoose.promise) {
    globalForMongoose.promise = mongoose.connect(uri, { bufferCommands: false });
  }

  globalForMongoose.conn = await globalForMongoose.promise;
  return globalForMongoose.conn;
}
