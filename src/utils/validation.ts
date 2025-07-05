
import { z } from 'zod';
import { VALID_SCHOOL_IDS } from '@/config/constants';

// Schema for validating school selection
export const schoolIdSchema = z.enum(VALID_SCHOOL_IDS);

// Schema for validating passcode input
export const passcodeSchema = z.string().length(4).regex(/^\d{4}$/, 'Passcode must be 4 digits');

// Schema for validating menu item IDs
export const itemIdSchema = z.string().min(1).max(50).regex(/^[a-zA-Z0-9-]+$/, 'Invalid item ID format');

// Validation functions
export const validateSchoolId = (schoolId: unknown): string | null => {
  try {
    return schoolIdSchema.parse(schoolId);
  } catch {
    return null;
  }
};

export const validatePasscode = (passcode: unknown): string | null => {
  try {
    return passcodeSchema.parse(passcode);
  } catch {
    return null;
  }
};

export const validateItemId = (itemId: unknown): string | null => {
  try {
    return itemIdSchema.parse(itemId);
  } catch {
    return null;
  }
};

// Content sanitization helper
export const sanitizeDisplayText = (text: string): string => {
  return text.replace(/[<>]/g, '');
};
