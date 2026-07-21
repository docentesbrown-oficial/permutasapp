import { redirect } from "next/navigation";
import { MobileNewPuestoForm } from "@/components/MobileNewPuestoForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function MobileNewPuestoPage() {
  const supabase =
    createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <MobileNewPuestoForm />;
}
