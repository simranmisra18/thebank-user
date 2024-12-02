"use client";

import { useState } from "react";
import { MagnifyingGlass } from "react-loader-spinner";

// {"transaction_id":"ly2-1732929116777","from_id":"i3l-iij","to_id":"CUST003","amount":1,"cat":"USER_USER","stat":"COMPLETE","last_update":"2024-11-30T08:12:09.000Z","comments":"Payment Initiated"}

type Transaction = {
  transaction_id: string;
  from_id: string;
  to_id: string;
  amount: number;
  cat: string;
  stat: string;
  comments: string;
};

export const TrackTransaction = () => {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [tid, setTid] = useState("");
  const [loading, setLoading] = useState(false);
  return (
    <div className="p-8 m-4 bg-white flex flex-col w-4/5 sm:w-1/2 justify-center items-center rounded-lg">
      <h3 className="text-2xl">Track a transaction by id</h3>
      <form
        className="mt-2 flex gap-1"
        onSubmit={(e) => {
          e.preventDefault();
          setLoading(true);
          fetch(`/api/transaction?transaction_id=${tid}`)
            .then((res) => res.json())
            .then((res) => {
              if (res.error) {
                throw new Error(res.message ?? "invalid id");
              } else {
                setTransaction(res);
              }
            })
            .catch((err) => {
              alert("Error " + err.message);
            })
            .finally(() => setLoading(false));
        }}
      >
        <input
          className="px-2 py-1 border"
          placeholder="Enter Transaction ID"
          value={tid}
          onChange={(e) => setTid(e.target.value)}
        />
        <button type="submit" className="px-2 py-1 border hover:bg-slate-200">
          {" "}
          Search
        </button>
      </form>
      <MagnifyingGlass visible={loading} />
      {transaction ? (
          <table className="mt-2">
            <tr className="border-b">
              <th className="text-left">Transaction ID  </th>
              <td className="pl-2">{transaction.transaction_id}</td>
            </tr>
            <tr className="border-b">
              <th className="text-left">Sender ID </th>
              <td className="pl-2">{transaction.from_id}</td>
            </tr>
            <tr className="border-b">
              <th className="text-left">Reciever ID </th>
              <td className="pl-2">{transaction.to_id}</td>
            </tr>
            <tr className="border-b">
              <th className="text-left">Amount </th>
              <td className="pl-2">{transaction.amount}</td>
            </tr>
            <tr className="border-b">
              <th className="text-left">Status </th>
              <td className="pl-2">{transaction.stat}</td>
            </tr>
            <tr>
              <th className="text-left">Comments </th>
              <td className="pl-2">{transaction.comments}</td>
            </tr>
          </table>
      ) : null}
    </div>
  );
};
