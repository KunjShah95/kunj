export type ErrorType = 'auth' | 'authorization' | 'validation' | 'network' | 'unknown';

export interface ErrorInfo {
  type: ErrorType;
  message: string;
  userMessage: string;
}

/**
 * Interpret Supabase errors and provide user-friendly messages
 * @param error - The error object from Supabase
 * @returns ErrorInfo with type and user-friendly message
 */
export function interpretSupabaseError(error: any): ErrorInfo {
  const message = error?.message?.toLowerCase() || '';
  const code = error?.code || '';

  // Log all errors for debugging
  console.log('[ErrorUtils] Interpreting error:', {
    message: error?.message,
    code: error?.code,
    details: error
  });

  // RLS Policy Violations
  if (message.includes('row-level security') || 
      message.includes('rls') || 
      message.includes('policy')) {
    console.error('[ErrorUtils] RLS Policy Violation detected:', {
      message: error.message,
      code: error.code,
      hint: error.hint,
      details: error.details
    });
    return {
      type: 'authorization',
      message: error.message,
      userMessage: "You don't have permission to perform this action. Please contact an administrator."
    };
  }

  // Authentication Errors
  if (message.includes('not authenticated') || 
      message.includes('jwt') ||
      message.includes('token') ||
      code === 'PGRST301') {
    console.error('[ErrorUtils] Authentication error detected:', {
      message: error.message,
      code: error.code,
      details: error
    });
    return {
      type: 'auth',
      message: error.message,
      userMessage: 'Your session has expired. Please log in again.'
    };
  }

  // Invalid Credentials
  if (message.includes('invalid login') || 
      message.includes('invalid credentials') ||
      message.includes('email not confirmed')) {
    console.error('[ErrorUtils] Invalid credentials error:', {
      message: error.message,
      code: error.code
    });
    return {
      type: 'auth',
      message: error.message,
      userMessage: error.message // Use original message for login errors
    };
  }

  // Validation Errors
  if (message.includes('violates') || 
      message.includes('constraint') ||
      message.includes('invalid') ||
      message.includes('required')) {
    console.error('[ErrorUtils] Validation error detected:', {
      message: error.message,
      code: error.code,
      details: error.details
    });
    return {
      type: 'validation',
      message: error.message,
      userMessage: 'Please check your input and try again.'
    };
  }

  // Network Errors
  if (message.includes('network') || 
      message.includes('fetch') ||
      message.includes('connection')) {
    console.error('[ErrorUtils] Network error detected:', {
      message: error.message,
      code: error.code
    });
    return {
      type: 'network',
      message: error.message,
      userMessage: 'Connection error. Please check your internet and try again.'
    };
  }

  // Unknown Errors
  console.error('[ErrorUtils] Unknown error type:', {
    message: error.message || 'Unknown error',
    code: error.code,
    fullError: error
  });
  return {
    type: 'unknown',
    message: error.message || 'Unknown error',
    userMessage: 'An unexpected error occurred. Please try again.'
  };
}

/**
 * Get a user-friendly error message for common error types
 * @param errorType - The type of error
 * @returns A user-friendly error message
 */
export function getUserFriendlyMessage(errorType: ErrorType): string {
  const messages: Record<ErrorType, string> = {
    auth: 'Your session has expired. Please log in again.',
    authorization: "You don't have permission for this action. Contact an administrator.",
    validation: 'Please check your input and try again.',
    network: 'Connection error. Check your internet and try again.',
    unknown: 'An unexpected error occurred. Please try again.'
  };

  return messages[errorType];
}
