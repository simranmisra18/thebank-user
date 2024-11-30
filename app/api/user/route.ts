import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(req: Request) {
  const sql = neon(process.env.DATABASE_URL ?? '');
  const { searchParams } = new URL(req.url);
  const userid = searchParams.get('userid');
  if(!userid){
    return NextResponse.json({error : true, message: 'invalid params'}, {status : 400});
  }
  const data = await sql(`SELECT customer_id, first_name, middle_name, last_name, pincode, credit_limit, credit_usage, credit_score, balance, registration_time from Customers where customer_id='${userid}'`);
  if(data.length === 0){
    return NextResponse.json({error : true, message: 'userid doesnt exist', userid}, {status : 402});
  }
  return NextResponse.json(data[0]);
}