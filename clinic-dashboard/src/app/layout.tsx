import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
	variable: "--font-body",
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
});

const instrumentSerif = Instrument_Serif({
	variable: "--font-display",
	subsets: ["latin"],
	weight: "400",
});

export const metadata: Metadata = {
	title: "ReEntry — Clinic Dashboard",
	description: "Clinical dashboard for postpartum recovery monitoring",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${dmSans.variable} ${instrumentSerif.variable} h-full`}
		>
			<body className="h-full antialiased">{children}</body>
		</html>
	);
}
