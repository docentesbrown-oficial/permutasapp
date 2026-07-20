export const ABC_EMAIL_REGEX = /^[^\s@]+@abc\.gob\.ar$/i;

export function isAbcEmail(email: string): boolean {
  return ABC_EMAIL_REGEX.test(email.trim());
}

export function normalizePid(pid: string): string {
  return pid.trim().replace(/\s+/g, "").toUpperCase();
}
