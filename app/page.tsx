"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    setLoading(true);
    e.preventDefault();
    const user_id = userId;
    if(password.toLowerCase() !== password){
      alert('Password can not be upper case');
      return;
    }
    fetch(`/api/login?${new URLSearchParams({ user_id, password })}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.error) {
          alert(res.message);
        } else {
          const { token, data: user } = res;
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
          router.push(`/user/${user.customer_id}/`);
        }
      })
      .catch((err) => {
        alert(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="flex flex-col h-[100vh] bg-slate-100 justify-center items-center" suppressHydrationWarning={true}>
      <form
        className="p-8 m-4 bg-white flex flex-col w-4/5 sm:w-1/2 justify-center items-center rounded-lg"
        onSubmit={onSubmit}
      >
        <h1 className="text-2xl sm:text-4xl">Login</h1>
        <input
          className="px-4 py-2 w-1/2 mt-2 outline-none border border-slate-200 rounded-md"
          placeholder="User ID"
          required
          aria-required
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <input
          className="px-4 py-2 w-1/2 mt-2 outline-none border border-slate-200 rounded-md"
          placeholder="password"
          type="password"
          required
          aria-required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="px-4 py-2 w-1/2 mt-2 outline-none border border-slate-200 rounded-md hover:bg-blue-500 hover:text-white"
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in.." : "Login"}
        </button>
        <Link href="#" className="text-blue-500 hover:underline mt-2">
          Unable to login? Contact support
        </Link>
        <Link href="/newuser" className="text-blue-500 hover:underline mt-2">
          New user? Click here
        </Link>
      </form>
    </div>
  );
}
