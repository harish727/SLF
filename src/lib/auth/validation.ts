export function validate(email: string, password: string) {
  const errors: { email?: string; password?: string } = {};
  if (!email.trim()) errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Enter a valid email address.';
  if (!password) errors.password = 'Password is required.';
  else if (password.length < 8) errors.password = 'Password must be at least 8 characters.';
  return errors;
}

export function validateSignup(fields: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirm: string;
  terms: boolean;
}) {
  const errors: Record<string, string> = {};
  if (!fields.firstName.trim()) errors.firstName = 'First name is required.';
  if (!fields.lastName.trim()) errors.lastName = 'Last name is required.';
  const emailErrors = validate(fields.email, fields.password);
  if (emailErrors.email) errors.email = emailErrors.email;
  if (emailErrors.password) errors.password = emailErrors.password;
  if (!fields.confirm) errors.confirm = 'Please confirm your password.';
  else if (fields.confirm !== fields.password) errors.confirm = 'Passwords do not match.';
  if (!fields.terms) errors.terms = 'You must accept the terms to continue.';
  return errors;
}
