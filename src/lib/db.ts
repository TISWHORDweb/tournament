import mongoose from "mongoose";

const globalForMongoose = globalThis as unknown as {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const SERVERLESS_OPTIONS = {
  bufferCommands: false,
  maxPoolSize: 1,
  serverSelectionTimeoutMS: 10_000,
  socketTimeoutMS: 45_000,
};

function validateDatabaseUrl(uri: string): void {
  if (uri.includes("localhost") || uri.includes("127.0.0.1")) {
    throw new Error(
      "DATABASE_URL points to localhost. Vercel cannot reach your local MongoDB — use a MongoDB Atlas connection string in Vercel Environment Variables."
    );
  }
}

export async function connectDB() {
  if (globalForMongoose.conn) return globalForMongoose.conn;

  const uri = process.env.DATABASE_URL?.trim();
  if (!uri) {
    throw new Error(
      "DATABASE_URL is not set. Add your MongoDB Atlas connection string in Vercel → Project → Settings → Environment Variables."
    );
  }

  validateDatabaseUrl(uri);

  if (!globalForMongoose.promise) {
    globalForMongoose.promise = mongoose.connect(uri, SERVERLESS_OPTIONS);
  }

  try {
    globalForMongoose.conn = await globalForMongoose.promise;
  } catch (error) {
    globalForMongoose.promise = null;
    globalForMongoose.conn = null;
    const message = error instanceof Error ? error.message : "Unknown database error";
    throw new Error(
      `MongoDB connection failed: ${message}. Check DATABASE_URL, Atlas network access (allow 0.0.0.0/0), and database credentials.`
    );
  }

  return globalForMongoose.conn;
}
