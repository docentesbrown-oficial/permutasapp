import nodemailer from "nodemailer";

type PostSummary = {
  description: string;
  school: string;
  district: string;
};

type MatchEmailData = {
  to: string;
  recipientName: string;
  otherTeacherName: string;
  pid: string;
  ownPost: PostSummary;
  otherPost: PostSummary;
  matchKey: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getRequiredEnvironmentVariable(
  name: string
) {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Falta configurar la variable ${name}.`
    );
  }

  return value;
}

function createTransporter() {
  const host =
    getRequiredEnvironmentVariable(
      "SMTP_HOST"
    );

  const port = Number(
    getRequiredEnvironmentVariable(
      "SMTP_PORT"
    )
  );

  const user =
    getRequiredEnvironmentVariable(
      "SMTP_USER"
    );

  const password =
    getRequiredEnvironmentVariable(
      "SMTP_PASSWORD"
    );

  if (!Number.isFinite(port)) {
    throw new Error(
      "SMTP_PORT debe ser un número válido."
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass: password,
    },
  });
}

export async function sendMatchEmail({
  to,
  recipientName,
  otherTeacherName,
  pid,
  ownPost,
  otherPost,
  matchKey,
}: MatchEmailData) {
  const transporter =
    createTransporter();

  const from =
    getRequiredEnvironmentVariable(
      "SMTP_FROM"
    );

  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL ??
    "https://permutasapp.vercel.app"
  ).replace(/\/+$/, "");

  const matchUrl =
    `${appUrl}/panel?match=` +
    encodeURIComponent(matchKey);

  const safeRecipientName =
    escapeHtml(recipientName);

  const safeOtherTeacherName =
    escapeHtml(otherTeacherName);

  const safePid = escapeHtml(pid);

  const safeOwnDescription =
    escapeHtml(ownPost.description);

  const safeOwnSchool =
    escapeHtml(ownPost.school);

  const safeOwnDistrict =
    escapeHtml(ownPost.district);

  const safeOtherDescription =
    escapeHtml(otherPost.description);

  const safeOtherSchool =
    escapeHtml(otherPost.school);

  const safeOtherDistrict =
    escapeHtml(otherPost.district);

  const subject =
    "🎉 ¡Tenés una nueva coincidencia en Permutas Docentes!";

  const text = [
    `Hola ${recipientName}:`,
    "",
    "¡Tenemos una buena noticia!",
    "",
    `Vos y ${otherTeacherName} manifestaron interés en avanzar con una posible permuta.`,
    "",
    `Código PID: ${pid}`,
    "",
    "TU PUESTO",
    `${ownPost.description}`,
    `${ownPost.school} · ${ownPost.district}`,
    "",
    "EL PUESTO QUE RECIBIRÍAS",
    `${otherPost.description}`,
    `${otherPost.school} · ${otherPost.district}`,
    "",
    "Ingresá a la aplicación para ver la coincidencia y contactar al otro docente por WhatsApp:",
    matchUrl,
    "",
    "Docentes Brown",
  ].join("\n");

  const html = `
    <!doctype html>
    <html lang="es">
      <body style="margin:0;padding:0;background:#f3efdc;font-family:Arial,Helvetica,sans-serif;color:#243746;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3efdc;padding:28px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border-radius:22px;overflow:hidden;box-shadow:0 14px 40px rgba(36,73,110,0.16);">
                <tr>
                  <td style="background:#24496e;padding:28px;text-align:center;">
                    <div style="font-size:42px;line-height:1;margin-bottom:12px;">
                      🎉
                    </div>

                    <div style="font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#f3efdc;">
                      Docentes Brown
                    </div>

                    <h1 style="margin:10px 0 0;color:#ffffff;font-size:28px;line-height:1.25;">
                      ¡Tenemos un match!
                    </h1>
                  </td>
                </tr>

                <tr>
                  <td style="padding:30px;">
                    <p style="margin:0 0 16px;font-size:17px;line-height:1.6;">
                      Hola <strong>${safeRecipientName}</strong>:
                    </p>

                    <p style="margin:0 0 22px;font-size:17px;line-height:1.6;">
                      Vos y <strong>${safeOtherTeacherName}</strong> manifestaron interés en avanzar con una posible permuta.
                    </p>

                    <div style="margin:0 0 22px;padding:15px 18px;border-radius:14px;background:#f3efdc;text-align:center;">
                      <div style="font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#24496e;">
                        Código de coincidencia
                      </div>

                      <div style="margin-top:5px;font-size:22px;font-weight:700;color:#24496e;">
                        PID ${safePid}
                      </div>
                    </div>

                    <div style="margin-bottom:16px;padding:18px;border:1px solid #e2e7eb;border-radius:16px;">
                      <div style="font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#da6863;">
                        Tu puesto
                      </div>

                      <h2 style="margin:8px 0 6px;font-size:18px;color:#24496e;">
                        ${safeOwnDescription}
                      </h2>

                      <p style="margin:0;font-size:15px;line-height:1.5;color:#55636f;">
                        ${safeOwnSchool}<br>
                        ${safeOwnDistrict}
                      </p>
                    </div>

                    <div style="margin-bottom:24px;padding:18px;border:1px solid #e2e7eb;border-radius:16px;">
                      <div style="font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#da6863;">
                        El puesto que recibirías
                      </div>

                      <h2 style="margin:8px 0 6px;font-size:18px;color:#24496e;">
                        ${safeOtherDescription}
                      </h2>

                      <p style="margin:0;font-size:15px;line-height:1.5;color:#55636f;">
                        ${safeOtherSchool}<br>
                        ${safeOtherDistrict}
                      </p>
                    </div>

                    <p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:#55636f;">
                      Ingresá a la aplicación para ver la coincidencia completa y contactar al otro docente por WhatsApp.
                    </p>

                    <div style="text-align:center;">
                      <a
                        href="${matchUrl}"
                        style="display:inline-block;padding:14px 24px;border-radius:12px;background:#da6863;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;"
                      >
                        Ver mi coincidencia
                      </a>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:20px 30px;background:#f7f7f7;text-align:center;font-size:13px;line-height:1.5;color:#6c7882;">
                    Este correo fue enviado automáticamente por Permutas Docentes de Docentes Brown.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
}
