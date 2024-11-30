import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(req: Request) {
  const sql = neon(process.env.DATABASE_URL ?? '');
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') ?? '';
  if(!q){
    return NextResponse.json({error : true, message: 'invalid params'}, {status : 400});
  }

  const query = `SELECT customer_id, first_name, last_name from Customers WHERE first_name LIKE '${q}%' OR last_name LIKE '${q}%' OR customer_id LIKE '${q}%' OR customer_id='${q}'`;
  console.log(query);
  const data = await sql(query);
  return NextResponse.json(data);
}