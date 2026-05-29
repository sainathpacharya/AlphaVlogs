/** Mask email for display, e.g. user@example.com → u***@e***.com */
export function maskEmail(email: string | undefined | null): string {
  const value = email?.trim();
  if (!value) {
    return '—';
  }
  const at = value.indexOf('@');
  if (at <= 0 || at === value.length - 1) {
    return '***';
  }
  const local = value.slice(0, at);
  const domain = value.slice(at + 1);
  const dot = domain.lastIndexOf('.');
  if (dot <= 0) {
    return `${local[0]}***@${domain[0]}***`;
  }
  const domainName = domain.slice(0, dot);
  const tld = domain.slice(dot);
  const maskedLocal = local.length <= 1 ? '*' : `${local[0]}${'*'.repeat(Math.min(local.length - 1, 3))}`;
  const maskedDomain =
    domainName.length <= 1 ? '*' : `${domainName[0]}${'*'.repeat(Math.min(domainName.length - 1, 3))}`;
  return `${maskedLocal}@${maskedDomain}${tld}`;
}

/** Mask mobile for display, e.g. +917013134330 → +91 70******30 */
export function maskMobile(mobile: string | undefined | null): string {
  const value = mobile?.trim();
  if (!value) {
    return '—';
  }
  const digits = value.replace(/\D/g, '');
  if (digits.length < 4) {
    return '****';
  }
  const lastTwo = digits.slice(-2);
  if (value.startsWith('+91') || (digits.startsWith('91') && digits.length === 12)) {
    const national = digits.startsWith('91') ? digits.slice(2) : digits.slice(-10);
    if (national.length >= 4) {
      return `+91 ${national.slice(0, 2)}******${lastTwo}`;
    }
  }
  const countryMatch = value.match(/^\+\d{1,2}/);
  if (countryMatch && digits.length >= 10) {
    const countryDigits = countryMatch[0].slice(1);
    const national = digits.slice(countryDigits.length);
    if (national.length >= 4) {
      const prefix = national.slice(0, 2);
      return `${countryMatch[0]} ${prefix}******${lastTwo}`;
    }
  }
  if (digits.length >= 10) {
    return `${digits.slice(0, 2)}******${lastTwo}`;
  }
  return `******${lastTwo}`;
}
