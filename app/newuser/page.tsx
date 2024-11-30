import Link from "next/link";

export default function Page() {
  return (
    <div className="flex flex-col h-[100vh] bg-slate-100 justify-center items-center">
      <div className="p-8 m-4 bg-white flex flex-col w-4/5 sm:w-1/2 justify-center items-center rounded-lg">
        <h1 className="text-xl">
          Go to your nearest branch with a valid id to create a bank account at
          the-bank
        </h1>
        <Link href="/" className="text-blue-500 hover:underline mt-2">
          Login to existing account
        </Link>
      </div>
    </div>
  );
}
