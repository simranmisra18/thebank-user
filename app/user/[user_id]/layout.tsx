"use client";

import Link from "next/link";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full h-full bg-slate-100 min-h-[100vh]">
      <div className="bg-transparent flex justify-end p-2">
        <Link
          href="/"
          className={`px-4 py-2 border hover:bg-slate-200 rounded-md`}
        >
          Logout
        </Link>
      </div>
      {children}
    </div>
  );
}