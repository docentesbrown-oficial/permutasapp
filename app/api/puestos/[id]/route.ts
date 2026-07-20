import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizePid } from "@/lib/validation";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
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
      .update({ description, pid, school, district, schedule })
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select("id, description, pid, school, district, schedule, status, created_at")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ puesto: data });
  } catch {
    return NextResponse.json({ error: "No pudimos modificar el puesto." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sesión vencida." }, { status: 401 });

  const { error } = await supabase.from("puestos").delete().eq("id", params.id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
