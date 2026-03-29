"use client";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<div className="max-w-md text-center">
				<h2 className="mb-2 text-2xl font-semibold text-text">
					Something went wrong
				</h2>
				<p className="mb-6 text-text-muted">
					We encountered an error loading this page. Please try again.
				</p>
				<button
					type="button"
					onClick={reset}
					className="rounded-lg bg-primary px-6 py-2 text-white transition-colors hover:bg-primary/90"
				>
					Try again
				</button>
			</div>
		</div>
	);
}
