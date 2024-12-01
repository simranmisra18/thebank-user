import { Check, Clock } from "lucide-react";
import { SugUser } from "../types";

const stats = [
  "SENT_FOR_APPROVAL",
  "INITIATED",
  "WITHDRAW_INIT",
  "WITHDRAW",
  "DEPOSIT_INIT",
  "COMPLETE",
];
export const TransactionState = ({ stat }: { stat: string }) => {
  if (stat === "FAILED") {
    return <h3>TRANSACTION FAILED</h3>;
  }

  const completed: { [a: string]: boolean } = {};
  for (const si of stats) {
    completed[si] = true;
    if (si === stat) {
      break;
    }
  }

  return (
    <div className="relative">
      <div className="bg-slate-300 absolute h-full w-[1px] left-2.5 z-0"></div>
      <div className="flex flex-col gap-2 z-10 my-4">
        <div className="flex gap-2">
          {completed[stats[0]] ? (
            <Check color="green" />
          ) : (
            <Clock color="maroon" />
          )}{" "}
          <h4>Awaiting automated approval</h4>
        </div>
        <div className="flex gap-2">
          {completed[stats[1]] ? (
            <Check color="green" />
          ) : (
            <Clock color="maroon" />
          )}{" "}
          <h4>Transaction Initiated</h4>
        </div>
        <div className="flex gap-2">
          {completed[stats[2]] ? (
            <Check color="green" />
          ) : (
            <Clock color="maroon" />
          )}{" "}
          <h4>Withdrawal Initiated</h4>
        </div>
        <div className="flex gap-2">
          {completed[stats[3]] ? (
            <Check color="green" />
          ) : (
            <Clock color="maroon" />
          )}{" "}
          <h4>Withdrawal Complete</h4>
        </div>
        <div className="flex gap-2">
          {completed[stats[4]] ? (
            <Check color="green" />
          ) : (
            <Clock color="maroon" />
          )}{" "}
          <h4>Deposit Initiated</h4>
        </div>
        <div className="flex gap-2">
          {completed[stats[5]] ? (
            <Check color="green" />
          ) : (
            <Clock color="maroon" />
          )}{" "}
          <h4>Transaction complete</h4>
        </div>
      </div>
    </div>
  );
};
