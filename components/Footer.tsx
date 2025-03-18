import Link from "next/link";

export default function Footer() {
    return (
        <footer className="flex justify-center items-center h-20">
            Built with ❤️ by <Link href={"https://x.com.com/ayushon_twt"} className="font-bold mx-0.5"> Ayush</Link>
        </footer>
    );
}