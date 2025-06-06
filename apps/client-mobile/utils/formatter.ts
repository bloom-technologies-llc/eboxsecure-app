export function e164ToHumanReadable(phoneNumber: string): string {
  // Ensure the input is in E.164 format
  const e164Pattern = /^\+(\d{1,3})(\d{10})$/;
  const match = phoneNumber.match(e164Pattern);

  if (!match) {
    throw new Error("Invalid E.164 phone number format.");
  }

  const [, countryCode, localNumber] = match;

  // Format the local number into (XXX) XXX-XXXX
  const formattedNumber = localNumber.replace(
    /(\d{3})(\d{3})(\d{4})/,
    "($1) $2-$3",
  );

  return `+${countryCode} ${formattedNumber}`;
}
