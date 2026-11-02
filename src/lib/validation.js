/**
 * Klique Shared Validation Helpers
 * Provides standardized validation checks and user-friendly error messages across all tools.
 */

export const validateRequired = (value, fieldName = 'This field') => {
   if (value === undefined || value === null || String(value).trim() === '') {
      return `${fieldName} is required`;
   }
   return null;
};

export const validatePositiveNumber = (
   value,
   fieldName = 'Number',
   { min = 0, max = Infinity, allowZero = true } = {}
) => {
   const reqErr = validateRequired(value, fieldName);
   if (reqErr) return reqErr;

   const num = Number(value);
   if (isNaN(num)) {
      return `${fieldName} must be a valid number`;
   }

   if (!allowZero && num === 0) {
      return `${fieldName} must be greater than 0`;
   }

   if (num < min) {
      return `${fieldName} cannot be less than ${min}`;
   }

   if (num > max) {
      return `${fieldName} cannot exceed ${max}`;
   }

   return null;
};

export const validatePercentage = (value, fieldName = 'Percentage') => {
   return validatePositiveNumber(value, fieldName, {
      min: 0,
      max: 100,
      allowZero: true,
   });
};

export const validateUrl = (value, fieldName = 'URL') => {
   const reqErr = validateRequired(value, fieldName);
   if (reqErr) return reqErr;

   try {
      const url = new URL(value);
      if (!['http:', 'https:'].includes(url.protocol)) {
         return `${fieldName} must start with http:// or https://`;
      }
      return null;
   } catch {
      return `Please enter a valid ${fieldName.toLowerCase()} (e.g. https://example.com)`;
   }
};

export const validateJSON = (text, fieldName = 'JSON') => {
   const reqErr = validateRequired(text, fieldName);
   if (reqErr) return reqErr;

   try {
      JSON.parse(text);
      return null;
   } catch (err) {
      return `Invalid JSON syntax: ${err.message}`;
   }
};

export const validateInteger = (
   value,
   fieldName = 'Value',
   { min = 0, max = Infinity } = {}
) => {
   const numErr = validatePositiveNumber(value, fieldName, { min, max });
   if (numErr) return numErr;

   if (!Number.isInteger(Number(value))) {
      return `${fieldName} must be a whole number`;
   }
   return null;
};

