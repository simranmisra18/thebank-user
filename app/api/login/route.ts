import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import md5 from "md5";

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
          sid += '-';
      }
      sid += s;
  }
  return sid;
}

export async function GET(req: Request) {
  const sql = neon(process.env.DATABASE_URL ?? '');
  let data = null;
  const { searchParams } = new URL(req.url);
  const customer_id = searchParams.get('user_id');
  const password = searchParams.get('password');
  const password_hash = md5(password ?? '');

  let user = null;
  try{ 
    data = await sql`select * from Customers WHERE customer_id=${customer_id} AND password_hash=${password_hash};`;
    console.log({q : `select * from Customers WHERE customer_id=${customer_id} AND password_hash=${password_hash};`, password})
    if(data.length === 1){
      user = data[0];
    } else {
      return NextResponse.json({
        error: true,
        message : 'Invalid credentials',
      }, {status: 401})
    }
  } catch(err : unknown){
    return NextResponse.json({
      error: true,
      message: err ?? 'Invalid Query',
    }, { status: 400 });
  }
  delete user.password_hash;

  const token = create_token();
  try{
    await sql("DELETE FROM Token WHERE for_id=$1", [customer_id]);
    await sql("INSERT INTO Token VALUES ($1, $2, $3)", [token, customer_id, true]);
    return NextResponse.json({
      data : user,
      token,
    });
  } catch(err : unknown){
    console.log("AMEY_ERROR", err);
    return NextResponse.json({
      error: true,
      message: err ?? 'Server Error',
    }, { status: 500 });
  }
}