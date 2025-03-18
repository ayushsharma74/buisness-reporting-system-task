// components/Navbar.tsx
"use client";

import Link from "next/link";

export default function Navbar() {


  return (
    <nav className="bg-gray-100 py-4 rounded-2xl my-3">
      <div className="container mx-auto flex justify-center gap-8">
        <Link href="/" className={`text-gray-700 hover:text-gray-900 `}>
          Financial Overview
        </Link>
        <Link href="/revenue-analysis" className={`text-gray-700 hover:text-gray-900 `}>
          Revenue Analysis
        </Link>
      </div>
    </nav>
  );
}