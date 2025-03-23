import "./globals.css";
import {Gloock} from "next/font/google";
import {Analytics} from '@vercel/analytics/next';

const poppins = Gloock({subsets: ["latin"], weight: "400"});

export const metadata = {
    title: "Chord Generator",
    description: "Generate chord progressions",
};

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className={poppins.className}>
        {children}
        <Analytics/>
        </body>
        </html>
    );
}
