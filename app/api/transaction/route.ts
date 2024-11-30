import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(req: Request) {
  const sql = neon(process.env.DATABASE_URL ?? '');
  const { searchParams } = new URL(req.url);
  const transaction_id = searchParams.get('transaction_id');
  if(!transaction_id){
    return NextResponse.json({error : true, message: 'invalid params'}, {status : 400});
  }
  const data = await sql(`SELECT * from Transactions where transaction_id='${transaction_id}'`);
  if(data.length === 0){
    return NextResponse.json({error : true, message: 'transaction doesnt exist', transaction_id}, {status : 402});
  }
  return NextResponse.json(data[0]);
}