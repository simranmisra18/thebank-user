import { Transaction } from "../types";
import { getTimeDifference } from "../utils";

export const UserTransactions = ({
  userTransactions,
  tloading,
}: {
  userTransactions: Transaction[];
  tloading: boolean;
}) => (
  <div className="p-8 m-4 bg-white flex flex-col w-4/5 sm:w-1/2 justify-center items-center rounded-lg">
    <h4 className="text-xl mb-4">Recent Transactions</h4>
    {userTransactions.length > 0 ? (
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
                <td className="w-32 whitespace-nowrap">{transaction.to_id}</td>
                <td className="w-32 whitespace-nowrap">{transaction.amount}</td>
                <td className="w-32 whitespace-nowrap">{transaction.stat}</td>
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
      <>{tloading ? <p>Loading...</p> : <p>No transactions to show</p>}</>
    )}
  </div>
);
