import { redirect } from "next/navigation";
import { adminLogout } from "@/actions/admin";

export async function logoutAction() {
  "use server";
  await adminLogout();
  redirect("/admin");
}
