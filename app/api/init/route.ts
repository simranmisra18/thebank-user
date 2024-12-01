import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

const THROTTLE = 3000;
const sql = neon(process.env.DATABASE_URL ?? '');

const create_token = () => {
  const letters = []
  for(let i=0;i<26;i++){
      letters.push(String.fromCharCode('a'.charCodeAt(0) + i));
  }
  for(let i=0;i<9;i++){
      letters.push(String(i));
  }

  let numid = Date.now();
  const id_l = [];
  const n = letters.length;
  while(numid > 0){
      id_l.push(letters[numid % n]);
      numid = Math.floor(numid / n);
  }
  numid = Math.floor(1e9 * Math.random());
  console.log(numid);
  while(numid > 0){
      id_l.push(letters[numid % n]);
      numid = Math.floor(numid / n);
  }
  let sid = "";
  let c = 0;
  for(const s of id_l){
      c++;
      if(c === 4){
          c = 0;
          return sid;
      }
      sid += s;
  }
  return sid;
}

const getTransactionId = () =>  `${create_token()}-${+Date.now()}`;

const getLastUpdate = () => (new Date()).toISOString().slice(0, 19).replace('T', ' ');

const sleep = (timer: number) => new Promise(res => setTimeout(() => res(0), timer));


const makePayment = (transaction_id	: string, from_id : string, to_id: string, amount: number) => {
  setTimeout(async() => {
    // first we verify that there is only one transaction from this account
    let pending;
    try{
      pending = (await sql(`SELECT Count(*) From Transactions WHERE from_id='${from_id}' AND stat!='COMPLETE' AND stat!='FAILED'`))[0].count;
      console.log(`SELECT Count(*) From Transactions WHERE from_id='${from_id}' AND stat!='COMPLETE' AND stat!='FAILED'`);
      console.log('PENDING TRANSACTIONS', pending);
      if(pending === '1'){
        // now remove money from his account
        const balance = Number((await sql(`select balance from Customers where customer_id='${from_id}'`))[0].balance);
        if(balance >= amount){
          console.log(`UPDATE transactions SET stat='WITHDRAW_INIT', last_update='${getLastUpdate()}' WHERE transaction_id='${transaction_id}'`);
          await sql(`UPDATE transactions SET stat='WITHDRAW_INIT', last_update='${getLastUpdate()}' WHERE transaction_id='${transaction_id}'`);
          
          await sleep(THROTTLE);
          console.log(`UPDATE Customers SET balance=${balance - amount} WHERE customer_id='${from_id}'`);
          await sql(`UPDATE Customers SET balance=${balance - amount} WHERE customer_id='${from_id}'`);
          console.log(`UPDATE transactions SET stat='WITHDRAW', last_update='${getLastUpdate()}' WHERE transaction_id='${transaction_id}'`);
          await sql(`UPDATE transactions SET stat='WITHDRAW', last_update='${getLastUpdate()}' WHERE transaction_id='${transaction_id}'`);

          await sleep(THROTTLE);
          console.log(`UPDATE transactions SET stat='DEPOSIT_INIT', last_update='${getLastUpdate()}' WHERE transaction_id='${transaction_id}'`);
          await sql(`UPDATE transactions SET stat='DEPOSIT_INIT', last_update='${getLastUpdate()}' WHERE transaction_id='${transaction_id}'`);
          console.log(`UPDATE Customers SET balance=balance+${amount} WHERE customer_id='${to_id}'`);
          await sql(`UPDATE Customers SET balance=balance+${amount} WHERE customer_id='${to_id}'`);

          await sleep(THROTTLE);
          console.log(`UPDATE transactions SET stat='COMPLETE', last_update='${getLastUpdate()}' WHERE transaction_id='${transaction_id}'`);
          await sql(`UPDATE transactions SET stat='COMPLETE', last_update='${getLastUpdate()}' WHERE transaction_id='${transaction_id}'`);
        } else {
          throw new Error('Insufficient Balance');
        }
      } else {
        throw new Error('Concurrent Transaction');
      }
    } catch(err){
      await sql(`UPDATE transactions SET stat='FAILED', comments='${(err as {message: string}).message ?? ''}' WHERE transaction_id='${transaction_id}'`);
      console.log(`UPDATE transactions SET stat='FAILED', comments='${(err as {message: string}).message ?? ''}' WHERE transaction_id='${transaction_id}'`);
      return;
    }

    await sleep(THROTTLE);

    pending = (await sql(`SELECT Count(*) From Transactions WHERE from_id='${from_id}' AND (stat='COMPLETE' OR stat='FAILED')`))[0].count;
    if(pending !== '0'){

    }

  }, THROTTLE);
}

export async function POST(req: Request) {
  try {
    // Parse the request body
    const body = await req.json();
    console.log({body});
    const { from_id, to_id, amount : amountString } = body;
    const amount = Number(amountString);

    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    const tokenValidation = await sql`SELECT for_id FROM Token WHERE token_id = ${token}`;

    if (tokenValidation.length === 0 || tokenValidation[0].for_id !== from_id) {
      return NextResponse.json({ error: true, message: 'Invalid token' }, { status: 403 });
    }
  

    // Validate required fields
    if (!from_id || !to_id || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: from_id, to_id, amount' }),
        { status: 400 }
      );
    }

    if(!(amount > 0)){
      return new Response(
        JSON.stringify({ error: 'Invalid amount' }),
        { status: 400 }
      );
    }


    console.log('Sending Money!');
    const pending = (await sql(`SELECT Count(*) From Transactions WHERE from_id='${from_id}' AND stat!='COMPLETE' AND stat!='FAILED'`))[0].count;

    if(pending !== '0'){
      return new Response(
        JSON.stringify({ message: 'Another transaction is currently pending, please wait', error: true }),
        { status: 400 }
      );
    }

    const transaction_id = getTransactionId();
    await sql(`INSERT INTO Transactions (transaction_id, from_id, to_id, amount, cat, stat, last_update, comments) VALUES 
    ('${transaction_id}', '${from_id}', '${to_id}', ${amount}, 'USER_USER', 'INITIATED', '${getLastUpdate()}', 'Payment Initiated');`)

    makePayment(transaction_id, from_id, to_id, amount);
    return NextResponse.json({
      from_id,
      to_id,
      amount,
      amountString,
      transaction_id,
      pending,
    });


  }catch (error) {
    console.error('Error adding transaction:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to add transaction' }),
      { status: 500 }
    );
  }
}