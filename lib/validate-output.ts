import {
  GenoRootIntakePayloadSchema,
  type GenoRootIntakePayload,
} from '@/types/schema';

export interface ValidationErrorDetail {
  path: string;
  field: string;
  message: string;
  code: string;
  received?: any;
}

export interface ValidationReport {
  valid: boolean;
  totalErrors: number;
  errors: ValidationErrorDetail[];
  missingFields: string[];
  schemaCompliant: boolean;
  summary: string;
  timestamp: string;
  validatedPayload?: GenoRootIntakePayload;
}

/**
 * Validates the complete assembled intake payload against the master GenoRoot Zod schema.
 * Pinpoints the exact schema keys for any missing, invalid, or malformed fields.
 */
export function validateIntakeOutput(payload: unknown): ValidationReport {
  const timestamp = new Date().toISOString();
  const result = GenoRootIntakePayloadSchema.safeParse(payload);

  if (result.success) {
    return {
      valid: true,
      totalErrors: 0,
      errors: [],
      missingFields: [],
      schemaCompliant: true,
      summary: '100% Valid — Payload matches all 16 questions and clinical schema specifications.',
      timestamp,
      validatedPayload: result.data,
    };
  }

  const errors: ValidationErrorDetail[] = [];
  const missingFields: string[] = [];

  for (const issue of result.error.issues) {
    const pathString = issue.path.join('.');
    const detail: ValidationErrorDetail = {
      path: pathString,
      field: String(issue.path[issue.path.length - 1] || 'root'),
      message: issue.message,
      code: issue.code,
    };

    errors.push(detail);

    if (
      issue.code === 'invalid_type' &&
      (issue as any).received === 'null' ||
      (issue as any).received === 'undefined'
    ) {
      missingFields.push(pathString);
    } else if (issue.message.toLowerCase().includes('required')) {
      missingFields.push(pathString);
    }
  }

  return {
    valid: false,
    totalErrors: errors.length,
    errors,
    missingFields: Array.from(new Set(missingFields)),
    schemaCompliant: false,
    summary: `Validation Failed with ${errors.length} error(s): ${errors.map((e) => `[${e.path}]: ${e.message}`).join('; ')}`,
    timestamp,
  };
}
