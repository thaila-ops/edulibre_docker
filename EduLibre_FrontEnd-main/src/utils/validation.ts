export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const CPF_REGEX = /^\d{11}$/;
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

function parseDateOnly(value: string) {
  return new Date(`${value}T00:00:00`);
}

export function validateEmail(email: string) {
  return EMAIL_REGEX.test(email.trim());
}

export function validateCpf(cpf: string) {
  return CPF_REGEX.test(cpf.replace(/\D/g, ''));
}

export function validatePassword(password: string) {
  return PASSWORD_REGEX.test(password.trim());
}

export function validateBirthDate(value: string) {
  if (!value.trim()) return false;
  const date = parseDateOnly(value);
  return !Number.isNaN(date.getTime()) && date <= new Date();
}

export function isAdult(value: string, minimumAge = 18) {
  const date = parseDateOnly(value);
  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const hasNotHadBirthdayYet =
    today.getMonth() < date.getMonth()
    || (today.getMonth() === date.getMonth() && today.getDate() < date.getDate());

  if (hasNotHadBirthdayYet) age -= 1;
  return age >= minimumAge;
}

export function getErrorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = error.response as { status?: number; data?: { message?: string } };
    if (response.data?.message) return response.data.message;
    if (response.status === 409) return 'Já existe uma conta com este e-mail ou CPF.';
    if (response.status === 400) return 'Revise os dados preenchidos e tente novamente.';
    if (response.status === 500) return 'O servidor encontrou um problema ao processar o cadastro.';
    return 'Ocorreu um erro inesperado.';
  }
  if (typeof error === 'object' && error !== null && 'request' in error) {
    return 'Não foi possível conectar ao servidor. Verifique se a API está ligada na porta 3001.';
  }
  return 'Ocorreu um erro inesperado.';
}
