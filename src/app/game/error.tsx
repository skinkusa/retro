"use client";

export default function GameError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background font-mono">
      <h1 className="text-xl font-black text-red-500 uppercase mb-4">Something went wrong</h1>
      <pre className="bg-black/80 text-white p-4 rounded-lg text-left text-sm overflow-auto max-w-2xl max-h-60 mb-6">
        {error.message}
      </pre>
      <button
        onClick={reset}
        className="px-6 py-3 bg-primary text-primary-foreground font-black uppercase rounded-xl hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
