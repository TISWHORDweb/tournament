"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isDbError =
    error.message.includes("DATABASE_URL") ||
    error.message.includes("MongoDB") ||
    error.message.includes("localhost");

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-2xl uppercase tracking-wide text-[#F0EBE3]">
        Something went wrong
      </h1>
      <p className="mt-4 text-sm text-[#A8B5A8]">
        {isDbError
          ? "The app could not connect to MongoDB. On Vercel, set DATABASE_URL to your MongoDB Atlas connection string (not localhost), allow network access from anywhere in Atlas, then redeploy."
          : "A server error occurred while loading this page."}
      </p>
      {process.env.NODE_ENV === "development" && (
        <pre className="mt-4 max-w-full overflow-x-auto rounded-lg border border-white/10 bg-white/5 p-4 text-left font-mono text-xs text-red-300">
          {error.message}
        </pre>
      )}
      <button type="button" onClick={reset} className="btn-primary mt-8">
        Try again
      </button>
    </div>
  );
}
