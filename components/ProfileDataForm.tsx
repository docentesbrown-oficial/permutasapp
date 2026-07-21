"use client";

import {
  FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";

type ProfileDataFormProps = {
  initialFullName: string;
  initialPhone: string;
  email: string;
};

export function ProfileDataForm({
  initialFullName,
  initialPhone,
  email,
}: ProfileDataFormProps) {
  const router = useRouter();

  const [fullName, setFullName] =
    useState(initialFullName);

  const [phone, setPhone] =
    useState(initialPhone);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [isError, setIsError] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(
        "/api/perfil",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            fullName,
            phone,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ??
            "No pudimos guardar los cambios."
        );
      }

      setMessage(
        "Tus datos se actualizaron correctamente."
      );

      router.refresh();
    } catch (error) {
      setIsError(true);

      setMessage(
        error instanceof Error
          ? error.message
          : "Ocurrió un error inesperado."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="profile-data-form"
    >
      <div className="field">
        <label htmlFor="profile-full-name">
          Nombre y apellido
        </label>

        <input
          id="profile-full-name"
          required
          value={fullName}
          onChange={(event) =>
            setFullName(
              event.target.value
            )
          }
          autoComplete="name"
          placeholder="Ej.: Laura Fernández"
        />
      </div>

      <div className="field">
        <label htmlFor="profile-phone">
          Teléfono de contacto
        </label>

        <input
          id="profile-phone"
          required
          value={phone}
          onChange={(event) =>
            setPhone(
              event.target.value
            )
          }
          autoComplete="tel"
          inputMode="tel"
          placeholder="Ej.: 11 4049 2855"
        />

        <p className="help">
          Este número se compartirá únicamente
          cuando haya interés recíproco.
        </p>
      </div>

      <div className="field">
        <label htmlFor="profile-email">
          Correo institucional
        </label>

        <input
          id="profile-email"
          value={email}
          readOnly
          disabled
        />

        <p className="help">
          El correo institucional no puede
          modificarse desde el perfil.
        </p>
      </div>

      <button
        className="btn btn-primary"
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          marginTop: 12,
        }}
      >
        {loading
          ? "Guardando..."
          : "Guardar datos personales"}
      </button>

      {message ? (
        <div
          className={
            isError
              ? "error"
              : "success"
          }
          role={
            isError
              ? "alert"
              : "status"
          }
          style={{
            marginTop: 12,
          }}
        >
          {message}
        </div>
      ) : null}
    </form>
  );
}
