import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DISTRITOS_PBA } from "@/data/distritos";

export async function PUT(request: Request) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sesión vencida." }, { status: 401 });

  try {
    const body = await request.json();
    const validDistricts = new Set<string>(DISTRITOS_PBA);
    const districts = Array.isArray(body.districts)
      ? body.districts.filter((district: unknown): district is string =>
          typeof district === "string" && validDistricts.has(district)
        )
      : [];

    const { error } = await supabase
      .from("profiles")
      .update({ preferred_districts: districts })
      .eq("id", user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No pudimos guardar las preferencias." }, { status: 500 });
  }
}
