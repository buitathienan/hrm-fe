import { cookies } from "next/headers";
import "server-only";

export async function clearSession() {
  const cookieStore = await cookies();

  cookieStore.delete("access_token");
}
