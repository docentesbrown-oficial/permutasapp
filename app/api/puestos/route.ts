import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizePid } from "@/lib/validation";

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Sesión vencida." }, { status: 401 });

  try {
    const body = await request.json();
    const description = String(body.description ?? "").trim();
    const pid = normalizePid(String(body.pid ?? ""));
    const school = String(body.school ?? "").trim();
    const district = String(body.district ?? "").trim();
    const schedule = Array.isArray(body.schedule) ? body.schedule : [];

    if (!description || !pid || !school || !district || schedule.length === 0) {
      return NextResponse.json({ error: "Completá todos los datos del puesto." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("puestos")
      .insert({ user_id: user.id, description, pid, school, district, schedule, status: "published" })
      .select("id, description, pid, school, district, schedule, status, created_at")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ puesto: data });
  } catch {
    return NextResponse.json({ error: "No pudimos guardar el puesto." }, { status: 500 });
  }
}
