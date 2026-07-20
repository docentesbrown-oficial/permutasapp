"use client";

type WhatsAppMatchButtonProps = {
  phone: string;
  message: string;
};

function normalizeArgentinaPhone(phone: string) {
  let digits = phone.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("549")) {
    return digits;
  }

  if (digits.startsWith("54")) {
    digits = digits.slice(2);
  }

  digits = digits.replace(/^0+/, "");

  for (const areaCodeLength of [2, 3, 4]) {
    const hasLocalMobilePrefix =
      digits.slice(
        areaCodeLength,
        areaCodeLength + 2
      ) === "15";

    const lengthWithoutPrefix =
      digits.length - 2;

    if (
      hasLocalMobilePrefix &&
      lengthWithoutPrefix === 10
    ) {
      digits =
        digits.slice(0, areaCodeLength) +
        digits.slice(areaCodeLength + 2);

      break;
    }
  }

  return `549${digits}`;
}

export function WhatsAppMatchButton({
  phone,
  message,
}: WhatsAppMatchButtonProps) {
  const normalizedPhone =
    normalizeArgentinaPhone(phone);

  const whatsappUrl =
    `https://wa.me/${normalizedPhone}` +
    `?text=${encodeURIComponent(message)}`;

  if (!normalizedPhone) {
    return (
      <button
        className="btn btn-accent"
        type="button"
        disabled
      >
        WhatsApp no disponible
      </button>
    );
  }

  return (
    <a
      className="btn btn-accent"
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      Contactar por WhatsApp
    </a>
  );
}
