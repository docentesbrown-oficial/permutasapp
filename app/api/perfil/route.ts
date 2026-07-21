import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function PUT(
  request: Request
) {
  const supabase =
    createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        error:
          "La sesión venció. Volvé a ingresar.",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const body = await request.json();

    const fullName = String(
      body.fullName ?? ""
    ).trim();

    const phone = String(
      body.phone ?? ""
    ).trim();

    const phoneDigits =
      phone.replace(/\D/g, "");

    if (!fullName || !phone) {
      return NextResponse.json(
        {
          error:
            "Completá el nombre y el teléfono.",
        },
        {
          status: 400,
        }
      );
    }

    if (fullName.length < 3) {
      return NextResponse.json(
        {
          error:
            "Ingresá tu nombre y apellido.",
        },
        {
          status: 400,
        }
      );
    }

    if (phoneDigits.length < 8) {
      return NextResponse.json(
        {
          error:
            "Ingresá un número de teléfono válido.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      error: profileError,
    } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone,
      })
      .eq("id", user.id);

    if (profileError) {
      return NextResponse.json(
        {
          error:
            profileError.message,
        },
        {
          status: 400,
        }
      );
    }

    const {
      error: metadataError,
    } = await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        phone,
      },
    });

    if (metadataError) {
      console.error(
        "No se pudieron actualizar los metadatos del usuario:",
        metadataError.message
      );
    }

    return NextResponse.json({
      ok: true,
      profile: {
        fullName,
        phone,
        email: user.email ?? "",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "No pudimos actualizar los datos del perfil.",
      },
      {
        status: 500,
      }
    );
  }
}
