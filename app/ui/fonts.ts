import { Inter, Lusitana } from "next/font/google";

export const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export const lusitana = Lusitana({
    subsets: ["latin"],
    variable: "--font-lusitana",
    weight: ["400", "700"],
})