/**
 * Canonical gate verification code.
 * The same value is encoded in:
 *  - The student profile QR
 *  - The full Student ID card barcode (front)
 *  - The mini ID preview barcode
 *  - And what the security gate scanner reads.
 *
 * Format: SCAMPUS:<student-uuid>:<register-number>
 * Tolerant decoder accepts variations.
 */

const PREFIX = "SCAMPUS";

export function buildGateCode(opts: { id?: string | null; registerNumber?: string | null }): string {
  const id = opts.id || "";
  const reg = (opts.registerNumber || "").toString().trim();
  return `${PREFIX}:${id}:${reg}`;
}

export function parseGateCode(raw: string): { id: string | null; registerNumber: string | null } | null {
  if (!raw) return null;
  const v = raw.trim();
  if (!v.toUpperCase().startsWith(PREFIX)) return null;
  const parts = v.split(":");
  // SCAMPUS : <id> : <reg>
  return {
    id: parts[1] || null,
    registerNumber: parts[2] || null,
  };
}
