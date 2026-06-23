import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { isAdminAuthenticated } from "@/lib/auth";

export default async function AdminLoginPage() {
  const authed = await isAdminAuthenticated();
  if (authed) redirect("/admin/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-20">
      <AdminLoginForm />
    </div>
  );
}
