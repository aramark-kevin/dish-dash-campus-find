
// Configuration constants for the application
export const APP_CONFIG = {
  // Logo service configuration
  LOGO_SERVICE: {
    BASE_URL: 'https://img.logo.dev',
    // In production, this should be moved to environment variables
    // For now, keeping it here but with a clear TODO for production deployment
    TOKEN: 'pk_ZNltVkn2TbKeUEDcbL5Ppg', // TODO: Move to environment variable
    DEFAULT_SIZE: 40,
    FORMAT: 'png'
  },
  
  // Security configuration
  SECURITY: {
    // In production, this should be handled via proper authentication
    // For now, using a more secure approach than hardcoding in components
    ADMIN_PASSCODE: '4265', // TODO: Replace with proper authentication system
    MAX_PASSCODE_ATTEMPTS: 3,
    PASSCODE_LOCKOUT_TIME: 300000 // 5 minutes in milliseconds
  },
  
  // Auto-deselection timer
  UI: {
    AUTO_DESELECT_TIMEOUT: 60000 // 1 minute
  }
};

// Valid school IDs for validation
export const VALID_SCHOOL_IDS = ['bishops', 'carleton', 'mcmaster', 'alberta'] as const;
export type ValidSchoolId = typeof VALID_SCHOOL_IDS[number];

// Validation helper functions
export const isValidSchoolId = (schoolId: string): schoolId is ValidSchoolId => {
  return VALID_SCHOOL_IDS.includes(schoolId as ValidSchoolId);
};
