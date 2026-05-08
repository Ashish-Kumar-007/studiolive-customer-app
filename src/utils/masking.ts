/**
 * Masks a phone number for sensitive data protection.
 * Example: +91 9876543210 -> +91 ******3210
 */
export const maskPhone = (phone: string) => {
  if (!phone) return '';
  const clean = phone.replace(/\s/g, '');
  if (clean.length < 8) return phone;
  return `${clean.slice(0, clean.length - 8)}*****${clean.slice(-3)}`;
};

/**
 * Masks an email address for sensitive data protection.
 * Example: ashish@example.com -> a***@example.com
 */
export const maskEmail = (email: string) => {
  if (!email) return '';
  const [name, domain] = email.split('@');
  if (name.length < 2) return email;
  return `${name[0]}***@${domain}`;
};
