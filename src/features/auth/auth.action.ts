"use server";
import { formLoginSchema } from "@/components/auth/login-form";
import { apiPost } from "@/lib/api";
import * as z from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { clearSession } from "./session";

export async function login(data: z.infer<typeof formLoginSchema>) {
  const res = await apiPost("/auth/signin", data);
  if (res.success) {
    const cookieStore = await cookies();
    const { access_token } = res.data as { access_token: string };

    cookieStore.set("access_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
    });
    redirect("/dashboard");
  }

  return res;
}

export async function getAccessToken() {
  const cookieStore = await cookies();

  return cookieStore.get("access_token")?.value;
}

export async function logout() {
  clearSession();

  redirect("/");
}
