import Link from "next/link";
import { redirect } from "next/navigation";
import { PanelHeader } from "@/components/PanelHeader";
import { ProfileDataForm } from "@/components/ProfileDataForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Profile = {
  full_name: string;
  phone: string | null;
};

export default async function ProfilePage() {
  const supabase =
    createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const {
    data: profileData,
    error,
  } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error(
      "No se pudo cargar el perfil:",
      error.message
    );
  }

  const profile = (
    profileData ?? {
      full_name:
        user.user_metadata
          ?.full_name ??
        user.email ??
        "Docente",
      phone:
        user.user_metadata
          ?.phone ??
        "",
    }
  ) as Profile;

  return (
    <>
      <PanelHeader
        fullName={profile.full_name}
      />

      <main
        className="shell"
        style={{
          maxWidth: 760,
          paddingTop: 34,
          paddingBottom: 60,
        }}
      >
        <div
          style={{
            marginBottom: 18,
          }}
        >
          <Link
            href="/panel?vista=escritorio"
            className="btn btn-ghost"
          >
            ← Volver al panel
          </Link>
        </div>

        <section className="card">
          <span className="eyebrow">
            Datos personales
          </span>

          <h2>
            Editar mi perfil
          </h2>

          <p className="help">
            Mantené actualizado tu teléfono.
            Este dato solo se comparte cuando
            existe una coincidencia con interés
            recíproco.
          </p>

          <div
            style={{
              marginTop: 22,
            }}
          >
            <ProfileDataForm
              initialFullName={
                profile.full_name
              }
              initialPhone={
                profile.phone ?? ""
              }
              email={
                user.email ?? ""
              }
            />
          </div>
        </section>
      </main>
    </>
  );
}
