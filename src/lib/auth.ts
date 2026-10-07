import crypto from "crypto"
import { prisma } from "./prisma";
import { cookies } from "next/headers";


const  SESSION_COOKIE_NAME = "lifestory_session";
const SESSION_DURATION = 30*24*60*60*1000; //30 days


export function generateSessionToken() {
    return crypto.randomBytes(32).toString("hex");
}

export async function createSession(userId:string) {
    const token   = generateSessionToken();

    const expiresAt = new Date(
        Date.now() + SESSION_DURATION
    );

    const session = await prisma.session.create({
        data:{
            token,
            userId,
            expiresAt
        }
    })

    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite :"lax",
        expires : expiresAt,
        path : "/"
    })
    return session
}

export async function getCurrentUser(){
    const cookieStore = await cookies();
    // console.log(cookieStore);

    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if(!token){
        return null;
    }
    const session = await prisma.session.findUnique({
        where:{
            token,
        },
        include:{
            user: true
        },
    });
    if(!session){
        return null;
    }
    // console.log(session.expiresAt);
    // console.log(new Date());
  console.log(session.expiresAt < new Date());
    if(session.expiresAt < new Date()){
        await prisma.session.delete({
            where:{
                id: session.id
            }
        });
        cookieStore.delete(SESSION_COOKIE_NAME);
        return null;
    }
    return session.user;
}

export async function deleteSession(){
    const cookieStore = await cookies();

    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if(!token){
        return;

    }
    await prisma.session.deleteMany({
        where:{token},
    });
    cookieStore.delete(SESSION_COOKIE_NAME);
}