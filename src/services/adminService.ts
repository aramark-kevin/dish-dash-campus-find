
import { APP_CONFIG } from '@/config/constants';
import { validatePasscode } from '@/utils/validation';

class AdminService {
  private failedAttempts = 0;
  private lastFailedAttempt = 0;

  public isLockedOut(): boolean {
    const timeSinceLastAttempt = Date.now() - this.lastFailedAttempt;
    return this.failedAttempts >= APP_CONFIG.SECURITY.MAX_PASSCODE_ATTEMPTS && 
           timeSinceLastAttempt < APP_CONFIG.SECURITY.PASSCODE_LOCKOUT_TIME;
  }

  public validatePasscode(inputPasscode: string): { success: boolean; error?: string } {
    // Validate input format first
    const validatedPasscode = validatePasscode(inputPasscode);
    if (!validatedPasscode) {
      return { success: false, error: 'Invalid passcode format' };
    }

    // Check if locked out
    if (this.isLockedOut()) {
      const remainingTime = Math.ceil((APP_CONFIG.SECURITY.PASSCODE_LOCKOUT_TIME - (Date.now() - this.lastFailedAttempt)) / 1000);
      return { success: false, error: `Too many failed attempts. Try again in ${remainingTime} seconds.` };
    }

    // Validate passcode
    if (validatedPasscode === APP_CONFIG.SECURITY.ADMIN_PASSCODE) {
      this.failedAttempts = 0;
      return { success: true };
    } else {
      this.failedAttempts++;
      this.lastFailedAttempt = Date.now();
      return { success: false, error: 'Incorrect passcode' };
    }
  }

  public getRemainingAttempts(): number {
    return Math.max(0, APP_CONFIG.SECURITY.MAX_PASSCODE_ATTEMPTS - this.failedAttempts);
  }
}

export const adminService = new AdminService();
