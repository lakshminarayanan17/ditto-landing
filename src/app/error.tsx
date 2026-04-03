"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ditto-grey-100 px-4">
      <h2 className="font-heading text-2xl font-bold text-ditto-black">
        Something went wrong
      </h2>
      <p className="text-center text-sm text-ditto-grey-600">
        We ran into an unexpected issue. Please try again.
      </p>
      <button
        onClick={reset}
        className="rounded-xl bg-ditto-blue px-6 py-3 font-heading text-base font-medium text-white transition-colors hover:bg-ditto-blue-dark"
      >
        Try again
      </button>
    </div>
  );
}
