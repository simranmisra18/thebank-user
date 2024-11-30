import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(req: Request) {
  const sql = neon(process.env.DATABASE_URL ?? '');
  const { searchParams } = new URL(req.url);
  const from_id = searchParams.get('from_id');
  console.log({from_id})
  if(!from_id){
    return NextResponse.json({error : true, message: 'invalid params'}, {status : 400});
  }
  const data = await sql(`SELECT * from Transactions where from_id='${from_id}'`);
  return NextResponse.json(data);
}