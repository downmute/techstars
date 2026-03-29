"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "register";

export default function LoginPage() {
	const router = useRouter();
	const supabase = createClient();

	const [mode, setMode] = useState<Mode>("login");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [clinicCode, setClinicCode] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			if (mode === "login") {
				const { error: signInError } = await supabase.auth.signInWithPassword({
					email,
					password,
				});
				if (signInError) throw signInError;
			} else {
			const { error: signUpError } = await supabase.auth.signUp({
				email,
				password,
			});
				if (signUpError) throw signUpError;

				const { data: session } = await supabase.auth.getSession();
				if (!session.session) {
					const { error: signInError } =
						await supabase.auth.signInWithPassword({ email, password });
					if (signInError) throw signInError;
				}

				const { error: rpcError } = await supabase.rpc("register_clinician", {
					p_clinic_code: clinicCode,
				});
				if (rpcError) throw rpcError;
			}

			router.replace("/");
			router.refresh();
		} catch (err: unknown) {
			const message =
				err instanceof Error ? err.message : "Something went wrong";
			setError(message);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4">
			<div className="w-full max-w-sm">
				<div className="mb-10 text-center">
					<h1 className="font-display text-4xl text-text">ReEntry</h1>
					<p className="mt-1 text-sm tracking-widest text-text-muted uppercase">
						Clinic Dashboard
					</p>
				</div>

				<form
					onSubmit={handleSubmit}
					className="rounded-2xl border border-border bg-surface p-8"
				>
					<h2 className="mb-6 text-lg font-semibold text-text">
						{mode === "login" ? "Sign in" : "Create account"}
					</h2>

					{error && (
						<div className="mb-4 rounded-lg bg-danger/10 px-4 py-2.5 text-sm text-danger">
							{error}
						</div>
					)}

					<label className="mb-4 block">
						<span className="mb-1 block text-xs font-medium tracking-wider text-text-secondary uppercase">
							Email
						</span>
						<input
							type="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text outline-none transition-colors focus:border-primary"
							placeholder="doctor@clinic.com"
						/>
					</label>

					<label className="mb-4 block">
						<span className="mb-1 block text-xs font-medium tracking-wider text-text-secondary uppercase">
							Password
						</span>
						<input
							type="password"
							required
							minLength={6}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text outline-none transition-colors focus:border-primary"
							placeholder="Min 6 characters"
						/>
					</label>

					{mode === "register" && (
						<label className="mb-4 block">
							<span className="mb-1 block text-xs font-medium tracking-wider text-text-secondary uppercase">
								Clinic Code
							</span>
							<input
								type="text"
								required
								value={clinicCode}
								onChange={(e) => setClinicCode(e.target.value)}
								className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text outline-none transition-colors focus:border-primary"
								placeholder="Enter your clinic code"
							/>
						</label>
					)}

					<button
						type="submit"
						disabled={loading}
						className="mt-2 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
					>
						{loading
							? "Please wait..."
							: mode === "login"
								? "Sign in"
								: "Create account"}
					</button>

					<p className="mt-5 text-center text-sm text-text-muted">
						{mode === "login" ? (
							<>
								New here?{" "}
								<button
									type="button"
									onClick={() => {
										setMode("register");
										setError("");
									}}
									className="font-medium text-primary hover:underline"
								>
									Create an account
								</button>
							</>
						) : (
							<>
								Already have an account?{" "}
								<button
									type="button"
									onClick={() => {
										setMode("login");
										setError("");
									}}
									className="font-medium text-primary hover:underline"
								>
									Sign in
								</button>
							</>
						)}
					</p>
				</form>
			</div>
		</div>
	);
}
