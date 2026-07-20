import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAbcEmail } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fullName = String(body.fullName ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!fullName || !phone || !email || !password) {
      return NextResponse.json({ error: "Completá todos los campos." }, { status: 400 });
    }

    if (!isAbcEmail(email)) {
      return NextResponse.json({ error: "El correo debe terminar en @abc.gob.ar." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres." }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();
    const origin = new URL(request.url).origin;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: { full_name: fullName, phone },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const needsEmailConfirmation = !data.session;
    return NextResponse.json({
      message: needsEmailConfirmation
        ? "Cuenta creada. Revisá tu correo @abc.gob.ar para confirmarla."
        : "Cuenta creada correctamente. Ya podés ingresar.",
    });
  } catch {
    return NextResponse.json({ error: "No pudimos procesar el registro." }, { status: 500 });
  }
}
