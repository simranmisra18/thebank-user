"use client";
import { useEffect, useState } from "react";
import { SugUser } from "../types";
import { TransactionState } from "./TransactionState";
import { Triangle } from "react-loader-spinner";

type Props = {
  transaction_id: string;
  transaction: {
    stat: string;
    comments: string;
  };
  selectedUser: SugUser | null;
  amount: number;
  setAmount: (a: number) => void;
  pay: () => void;
  ploading: boolean;
  setSelectedUser: (user: SugUser | null) => void;
  updateTransaction: () => void;
  setTransactionId: (id: string) => void;
  customer_id: string;
};

export const Transaction = ({
  transaction_id,
  transaction,
  selectedUser,
  amount,
  setAmount,
  pay,
  ploading,
  setSelectedUser,
  updateTransaction,
  setTransactionId,
  customer_id,
}: Props) => {
  const [q, setQ] = useState("");
  const [sloading, setSLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SugUser[]>([]);

  const getSuggestion = (q: string) => {
    setSLoading(true);
    fetch(`/api/users?q=${q}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setSuggestions(res);
      })
      .catch((err) => {
        alert("Error " + err.message);
      })
      .finally(() => setSLoading(false));
  };

  useEffect(() => {
    if (q.length) {
      setSLoading(true);
      const timeoutId = setTimeout(() => getSuggestion(q), 100);
      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions([]);
    }
  }, [q]);

  if (!transaction_id) {
    return (
      <div className="p-8 m-4 bg-white flex flex-col w-4/5 sm:w-1/2 justify-center items-center rounded-lg">
        {selectedUser ? (
          <form
            className="flex flex-col gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              pay();
            }}
          >
            <h4 className="text-xl mt-2">
              Pay to {selectedUser.first_name} {selectedUser.last_name}{" "}
              <small>{selectedUser.customer_id}</small>
            </h4>
            <div>
              <label htmlFor="payment:amount" className="mr-2">
                Amount
              </label>
              <input
                type="number"
                className="px-2 py-1 border"
                id="payment:amount"
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>
            <div className="flex">
              <button
                className="px-2 py-1 bg-green-200 hover:bg-green-300 border border-green-500"
                disabled={ploading}
              >
                Make Payment
              </button>
              <span className="flex-1"></span>
              <button
                className="px-2 py-1 hover:bg-slate-200 border border-collapse"
                type="button"
                onClick={() => setSelectedUser(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <h3 className="text-xl">Make a payment</h3>

            <div className="min-w-[50%] mt-2 relative">
              <input
                className="px-2 py-1 border w-full"
                placeholder="Search for payee"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              {q ? (
                <ul className="w-full border shadow">
                  {sloading ? (
                    <li className="px-2 py-1 hover:bg-slate-200">Loading...</li>
                  ) : null}
                  {suggestions
                    .filter((s) => s.customer_id !== customer_id)
                    .map((suggestion) => (
                      <li key={suggestion.customer_id}>
                        <button
                          className="w-full h-full px-2 py-1 hover:bg-slate-200 border border-collapse"
                          onClick={() => {
                            setSelectedUser(suggestion);
                            setQ("");
                          }}
                        >
                          {suggestion.first_name}{" "}
                          <small className="text-gray-800 font-mono">
                            {suggestion.customer_id}
                          </small>
                        </button>
                      </li>
                    ))}
                  {suggestions.length === 0 && !sloading ? (
                    <li className="px-2 py-1 hover:bg-slate-200">
                      No payees found
                    </li>
                  ) : null}
                </ul>
              ) : null}
            </div>
          </>
        )}
      </div>
    );
  }
  return (
    <div className="p-8 m-4 bg-white flex flex-col w-4/5 sm:w-1/2 justify-center items-center rounded-lg">
      {transaction.stat !== "COMPLETE" && transaction.stat !== "FAILED" ? (
        <Triangle />
      ) : null}
      <h3 className="text-xl">Transaction Id : {transaction_id} </h3>
      <TransactionState stat={transaction.stat} />
      {transaction.stat === "COMPLETE" ? (
        <p>
          {amount} has been sent to {selectedUser?.first_name}{" "}
          <small>{selectedUser?.customer_id}</small>
        </p>
      ) : null}
      {transaction.stat !== "COMPLETE" ? <p>{transaction.comments}</p> : null}
      {transaction.stat !== "COMPLETE" && transaction.stat !== "FAILED" ? (
        <>
          {" "}
          <button
            className="px-2 py-1 border hover:bg-slate-200"
            onClick={updateTransaction}
          >
            Refresh
          </button>
          <p>Note: payment info will auto refresh every second</p>
        </>
      ) : (
        <button
          className="px-2 py-1 border hover:bg-slate-200"
          onClick={() => {
            setTransactionId("");
            setSelectedUser(null);
          }}
        >
          Return
        </button>
      )}
    </div>
  );
};
