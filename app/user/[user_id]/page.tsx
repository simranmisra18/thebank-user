"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Triangle } from "react-loader-spinner";
import { TransactionState } from "./components/TransactionState";

type User = {
  customer_id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  balance: string;
};

type SugUser = {
  customer_id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
};

type Transaction = {
  from_id: string;
  to_id: string;
  amount: number;
  comments: string;
  stat: string;
  transaction_id: string;
  last_update: string;
};

function getTimeDifference(date1: string) {
  // Convert both dates to timestamps
  const diffInMs = Math.abs(+new Date(date1) - +new Date()); // Difference in milliseconds

  // Convert milliseconds to seconds, minutes, hours, and days
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  // Determine the appropriate unit for the difference
  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds === 1 ? "" : "s"}`;
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"}`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"}`;
  } else {
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"}`;
  }
}

export default function Page() {
  const { user_id: customer_id } = useParams<{
    user_id: string;
  }>();

  const [user, setUser] = useState<User | null>(null);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [sloading, setSLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SugUser | null>(null);
  const [suggestions, setSuggestions] = useState<SugUser[]>([]);
  const [ploading, setPloading] = useState(false);
  const [tloading, setTloading] = useState(false);
  const [amount, setAmount] = useState(0);
  const [transaction_id, setTransactionId] = useState("");
  const [transaction, setTransaction] = useState({
    stat: "SENT_FOR_APPROVAL",
    comments: "Transaction Sent for approval",
  });
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);

  const loadUserTransactions = useCallback(() => {
    setTloading(true);
    fetch(`/api/transactions?from_id=${customer_id}`)
      .then((res) => res.json())
      .then((res) => {
        setUserTransactions(res);
      })
      .catch((err) => {
        alert("Error Loading transactions " + err.message);
      })
      .finally(() => setTloading(false));
  }, [customer_id]);

  const getUser = useCallback(() => {
    setLoading(true);
    fetch(`/api/user?userid=${customer_id}`)
      .then((res) => res.json())
      .then((res) => {
        setUser(res);
      })
      .catch((err) => {
        alert("Error " + err.message);
      })
      .finally(() => setLoading(false));
  }, [customer_id]);

  const getSuggestion = (q: string) => {
    setSLoading(true);
    fetch(`/api/users?q=${q}`)
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

  const updateTransaction = useCallback(() => {
    console.log("CALLED UPDATE TRANSACTION");
    if (transaction_id) {
      if (transaction.stat !== "COMPLETE" && transaction.stat !== "FAILED") {
        fetch(`/api/transaction?transaction_id=${transaction_id}`)
          .then((res) => res.json())
          .then((res) => {
            if (res.stat === "COMPLETE" || res.stat === "FAILED") {
              loadUserTransactions();
            }
            setTransaction(res);
          })
          .catch((err) => {
            alert("Error loading transaction status " + err.message);
          });
      }
    }
  }, [transaction, transaction_id, loadUserTransactions]);

  const pay = useCallback(() => {
    setPloading(false);
    fetch("/api/init", {
      method: "POST",
      body: JSON.stringify({
        from_id: customer_id,
        to_id: selectedUser?.customer_id ?? "",
        amount,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.error) {
          alert("ERROR " + res.error);
        } else {
          // transaction successful
          setTransactionId(res.transaction_id);
          setTransaction({
            stat: "SENT_FOR_APPROVAL",
            comments: "Transaction Sent for approval",
          });
          setTimeout(updateTransaction, 1000);
        }
      })
      .catch((err) => {
        alert("Error " + err.message);
      })
      .finally(() => setPloading(false));
  }, [selectedUser, customer_id, amount, updateTransaction]);

  useEffect(getUser, [getUser]);
  useEffect(() => {
    const timeoutId = setTimeout(updateTransaction, 1000);
    return () => clearTimeout(timeoutId);
  }, [transaction, updateTransaction]);

  useEffect(loadUserTransactions, [loadUserTransactions]);

  if (loading) return <h1 className="text-center">Loading...</h1>;
  if (!user)
    return (
      <h1 className="text-center">
        Error Loading User, please refresh the page
      </h1>
    );

  return (
    <div className="flex flex-col min-h-[100vh] bg-slate-100 justify-center items-center py-10">
      {!user ? (
        <h1>Loading User...</h1>
      ) : (
        <>
          <h1 className="text-3xl">
            Hello {user.first_name} {user.last_name}
          </h1>
          <div className="p-8 m-4 bg-white flex flex-col w-4/5 sm:w-1/2 justify-center items-center rounded-lg">
            <h3 className="text-2xl">
              Current balance: <strong>{user.balance}</strong>
            </h3>
            <h4 className="text-xl mt-4">Recent Transactions</h4>
            {userTransactions.length ? (
              <div className="overflow-x-auto w-full">
                <table className="table-layout: auto; table-fixed text-center border w-full">
                  <thead>
                    <tr className="border">
                      <th className="w-32 whitespace-nowrap">Reciever ID</th>
                      <th className="w-32 whitespace-nowrap">Amount</th>
                      <th className="w-32 whitespace-nowrap">Status</th>
                      <th className="w-32 whitespace-nowrap">Date</th>
                      <th className="w-64 whitespace-nowrap">Comments</th>
                    </tr>
                  </thead>
                  <tbody className="max-h-64 overflow-y-auto">
                    {userTransactions.map((transaction) => (
                      <tr className="border" key={transaction.transaction_id}>
                        <td className="w-32 whitespace-nowrap">
                          {transaction.to_id}
                        </td>
                        <td className="w-32 whitespace-nowrap">
                          {transaction.amount}
                        </td>
                        <td className="w-32 whitespace-nowrap">
                          {transaction.stat}
                        </td>
                        <td className="w-32 whitespace-nowrap">
                          {getTimeDifference(transaction.last_update)}
                        </td>
                        <td className="w-64 whitespace-nowrap">
                          {transaction.comments.slice(0, 25)}
                          {transaction.comments.length > 25 ? "..." : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <>
                {tloading ? <p>Loading...</p> : <p>No transactions to show</p>}
              </>
            )}
            {/* {JSON.stringify(user)} */}
          </div>
          {!transaction_id ? (
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
                          <li className="px-2 py-1 hover:bg-slate-200">
                            Loading...
                          </li>
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
          ) : (
            <div className="p-8 m-4 bg-white flex flex-col w-4/5 sm:w-1/2 justify-center items-center rounded-lg">
              {transaction.stat !== "COMPLETE" &&
              transaction.stat !== "FAILED" ? (
                <Triangle />
              ) : null}
              <h3 className="text-xl">Transaction Id : {transaction_id} </h3>
              <TransactionState stat={transaction.stat} />
              <p>{transaction.comments}</p>
              {transaction.stat !== "COMPLETE" &&
              transaction.stat !== "FAILED" ? (
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
          )}
        </>
      )}
    </div>
  );
}
