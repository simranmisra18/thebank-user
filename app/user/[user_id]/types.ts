export type Transaction = {
  from_id: string;
  to_id: string;
  amount: number;
  comments: string;
  stat: string;
  transaction_id: string;
  last_update: string;
};

export type SugUser = {
  customer_id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
};
