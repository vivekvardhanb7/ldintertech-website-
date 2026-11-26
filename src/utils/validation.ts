export const PRODUCT_CATEGORIES = [
  'Medical Vending Machine',
  'Pizza Vending Machine',
  'Snack Vending Machine',
  'Return Vending Machine',
  'Other / Custom Solution',
] as const;

export type ProductCategoryOption = (typeof PRODUCT_CATEGORIES)[number];

export interface ConsultationPayload {
  name: string;
  company: string;
  email: string;
  phone: string;
  productCategory: ProductCategoryOption;
  location: string;
  message: string;
}

export interface ValidationErrors {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  productCategory?: string;
  location?: string;
  message?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^[+\d\s().-]{6,24}$/;

export function sanitizeField(value: unknown, maxLength = 500): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

export function validateConsultationInput(
  raw: Partial<Record<keyof ConsultationPayload, unknown>>
): { valid: boolean; errors: ValidationErrors; sanitized: ConsultationPayload } {
  const name = sanitizeField(raw.name, 120);
  const company = sanitizeField(raw.company, 160);
  const email = sanitizeField(raw.email, 160);
  const phone = sanitizeField(raw.phone, 40);
  const location = sanitizeField(raw.location, 160);
  const message = sanitizeField(raw.message, 2000);
  const rawCategory = sanitizeField(raw.productCategory, 80);

  const productCategory = (PRODUCT_CATEGORIES as readonly string[]).includes(rawCategory)
    ? (rawCategory as ProductCategoryOption)
    : 'Medical Vending Machine';

  const errors: ValidationErrors = {};

  if (name.length < 2) {
    errors.name = 'Please enter your full name (at least 2 characters).';
  }
  if (company.length < 2) {
    errors.company = 'Please enter your organization or company name.';
  }
  if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Please enter a valid business email address.';
  }
  if (phone.length > 0 && !PHONE_REGEX.test(phone)) {
    errors.phone = 'Please enter a valid phone number or leave blank.';
  }
  if (!(PRODUCT_CATEGORIES as readonly string[]).includes(rawCategory)) {
    errors.productCategory = 'Please select a valid vending machine category.';
  }
  if (location.length < 2) {
    errors.location = 'Please enter your target city or deployment region.';
  }
  if (message.length < 10) {
    errors.message = 'Please share a brief overview of your requirements (at least 10 characters).';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      name,
      company,
      email,
      phone,
      productCategory,
      location,
      message,
    },
  };
}
