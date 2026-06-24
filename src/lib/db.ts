import mongoose from "mongoose";

const globalForMongoose = globalThis as unknown as {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const DEFAULT_DB_NAME = "tech_turf_tournament";

const ATLAS_OPTIONS = {
  bufferCommands: false,
  maxPoolSize: 1,
  serverSelectionTimeoutMS: 10_000,
  socketTimeoutMS: 45_000,
  family: 4 as const,
};

const LOCAL_OPTIONS = {
  bufferCommands: false,
};

function isVercelRuntime(): boolean {
  return process.env.VERCEL === "1";
}

function isLocalDatabaseUrl(uri: string): boolean {
  return /localhost|127\.0\.0\.1/.test(uri);
}

function normalizeMongoUri(uri: string): string {
  if (!uri.startsWith("mongodb+srv://") && !uri.startsWith("mongodb://")) {
    return uri;
  }

  const match = uri.match(/^(mongodb(?:\+srv)?:\/\/[^/]+)(\/[^?]*)?(\?.*)?$/);
  if (!match) return uri;

  const [, base, path = "", query = ""] = match;
  if (path && path !== "/") return uri;

  return `${base}/${DEFAULT_DB_NAME}${query}`;
}

function getConnectionOptions(uri: string) {
  return isLocalDatabaseUrl(uri) ? LOCAL_OPTIONS : ATLAS_OPTIONS;
}

export async function connectDB() {
  if (globalForMongoose.conn) return globalForMongoose.conn;

  const rawUri = process.env.DATABASE_URL?.trim();
  if (!rawUri) throw new Error("DATABASE_URL environment variable is not set");

  if (isVercelRuntime() && isLocalDatabaseUrl(rawUri)) {
    throw new Error("DATABASE_URL cannot point to localhost on Vercel");
  }

  const uri = isLocalDatabaseUrl(rawUri) ? rawUri : normalizeMongoUri(rawUri);

  if (!globalForMongoose.promise) {
    globalForMongoose.promise = mongoose.connect(uri, getConnectionOptions(uri));
  }

  try {
    globalForMongoose.conn = await globalForMongoose.promise;
  } catch (error) {
    globalForMongoose.promise = null;
    globalForMongoose.conn = null;
    throw error;
  }

  return globalForMongoose.conn;
}
