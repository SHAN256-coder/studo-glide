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

export function buildGateCode(opts: {
  id?: string | null;
  registerNumber?: string | null;
  name?: string | null;
  department?: string | null;
  section?: string | null;
}): string {
  const reg = (opts.registerNumber || "").toString().trim().toUpperCase();
  const name = (opts.name || "").toString().trim().toUpperCase();
  const dept = (opts.department || "").toString().trim().toUpperCase();
  const section = (opts.section || "").toString().trim().toUpperCase();
  // Human-readable payload shown directly by any QR scanner camera
  return [
    `${PREFIX} STUDENT VERIFICATION`,
    `NAME: ${name || "-"}`,
    `REGISTER NO: ${reg || "-"}`,
    `DEPARTMENT: ${dept || "-"}`,
    `SECTION: ${section || "-"}`,
    `ID: ${opts.id || "-"}`,
  ].join("\n");
}

export function parseGateCode(raw: string): { id: string | null; registerNumber: string | null } | null {
  if (!raw) return null;
  const v = raw.trim();
  if (!v.toUpperCase().includes(PREFIX)) return null;
  const regMatch = v.match(/REGISTER NO:\s*([^\n]+)/i);
  const idMatch = v.match(/ID:\s*([^\n]+)/i);
  return {
    id: idMatch ? idMatch[1].trim() : null,
    registerNumber: regMatch ? regMatch[1].trim() : null,
  };
}
