"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { UserTransactions } from "./components/UserTransactions";
import type { Transaction as TransactionType, SugUser } from "./types";
import { Transaction } from "./components/Transaction";
import { DIV_CLASSNAME } from "./constants";
import { TrackTransaction } from "./components/TrackTransaction";

type User = {
  customer_id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  balance: string;
  branch_id: string;
  credit_score: string;
};

export default function Page() {
  const { user_id: customer_id } = useParams<{
    user_id: string;
  }>();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SugUser | null>(null);
  const [ploading, setPloading] = useState(false);
  const [tloading, setTloading] = useState(false);
  const [amount, setAmount] = useState(0);
  const [transaction_id, setTransactionId] = useState("");
  const [transaction, setTransaction] = useState({
    stat: "SENT_FOR_APPROVAL",
    comments: "Transaction Sent for approval",
  });
  const [userTransactions, setUserTransactions] = useState<TransactionType[]>(
    []
  );

  const loadUserTransactions = useCallback(() => {
    setTloading(true);
    fetch(`/api/transactions?from_id=${customer_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
      },
    })
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
    fetch(`/api/user?userid=${customer_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setUser(res);
      })
      .catch((err) => {
        alert("Error " + err.message);
      })
      .finally(() => setLoading(false));
  }, [customer_id]);

  const updateTransaction = useCallback(() => {
    if (transaction_id) {
      if (transaction.stat !== "COMPLETE" && transaction.stat !== "FAILED") {
        fetch(`/api/transaction?transaction_id=${transaction_id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
          },
        })
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
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
      },
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

  const [view, setView] = useState<"PR" | "RT" | "PY" | "TT">("PR");

  if (loading) return <h1 className="text-center">Loading...</h1>;
  if (!user)
    return (
      <h1 className="text-center">
        Error Loading User, please refresh the page
      </h1>
    );

  return (
    <div className="flex flex-col bg-slate-100 justify-center items-center py-10">
      {!user ? (
        <h1>Loading User...</h1>
      ) : (
        <>
          <h1 className="text-3xl">
            Hello {user.first_name} {user.last_name}
          </h1>
          <div className={`${DIV_CLASSNAME}`}>
            <div className="flex gap-4 flex-col sm:flex-row">
              <button
                className={`px-4 py-2 border hover:bg-slate-200 rounded-md ${
                  view === "PR" ? "bg-slate-300" : ""
                }`}
                onClick={() => setView("PR")}
              >
                Your Profile
              </button>
              <button
                className={`px-4 py-2 border hover:bg-slate-200 rounded-md ${
                  view === "RT" ? "bg-slate-300" : ""
                }`}
                onClick={() => setView("RT")}
              >
                Recent Transactions
              </button>
              <button
                className={`px-4 py-2 border hover:bg-slate-200 rounded-md ${
                  view === "PY" ? "bg-slate-300" : ""
                }`}
                onClick={() => setView("PY")}
              >
                Make Payment
              </button>
              <button
                className={`px-4 py-2 border hover:bg-slate-200 rounded-md ${
                  view === "TT" ? "bg-slate-300" : ""
                }`}
                onClick={() => setView("TT")}
              >
                Track Transaction
              </button>
            </div>
          </div>
          {view === "PR" ? (
            <div className="p-8 m-4 bg-white flex flex-col w-4/5 sm:w-1/2 justify-center items-center rounded-lg">
              <h2 className="text-2xl mb-4">
                Current balance: <strong>{user.balance}</strong>
              </h2>
              <p className="text-large">
                Your registered branch id : <strong>{user.branch_id}</strong>
              </p>
              <p className="text-large">
                Your Credit Score : <strong>{user.credit_score}</strong>
              </p>
            </div>
          ) : null}
          {view === "RT" ? (
            <UserTransactions
              tloading={tloading}
              userTransactions={userTransactions}
            />
          ) : null}
          {view === "PY" ? (
            <Transaction
              {...{
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
              }}
            />
          ) : null}
          {view === "TT" ? <TrackTransaction /> : null}
        </>
      )}
    </div>
  );
}
