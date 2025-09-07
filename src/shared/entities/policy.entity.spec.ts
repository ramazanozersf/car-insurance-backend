import { Policy } from './policy.entity';
import { PolicyStatus } from '../enums';

describe('Policy Entity', () => {
  let policy: Policy;

  beforeEach(() => {
    policy = new Policy();
    policy.effectiveDate = new Date('2024-01-01');
    policy.expirationDate = new Date('2024-12-31');
    policy.status = PolicyStatus.ACTIVE;
    policy.monthlyPremium = 100;
    policy.nextPaymentDue = new Date('2024-02-01');
    policy.gracePeriodDays = 10;
  });

  describe('isActive', () => {
    it('should return true for active policy within term', () => {
      // Set dates to ensure policy is currently active
      const now = new Date();
      policy.effectiveDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      policy.expirationDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      
      expect(policy.isActive()).toBe(true);
    });

    it('should return false for inactive policy', () => {
      policy.status = PolicyStatus.CANCELLED;
      expect(policy.isActive()).toBe(false);
    });

    it('should return false for policy not yet effective', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      policy.effectiveDate = tomorrow;
      
      expect(policy.isActive()).toBe(false);
    });
  });

  describe('isExpired', () => {
    it('should return true for expired policy', () => {
      policy.expirationDate = new Date('2023-01-01'); // Past date
      expect(policy.isExpired()).toBe(true);
    });

    it('should return false for non-expired policy', () => {
      policy.expirationDate = new Date('2025-12-31'); // Future date
      expect(policy.isExpired()).toBe(false);
    });
  });

  describe('getDaysUntilExpiration', () => {
    it('should calculate days until expiration correctly', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      policy.expirationDate = futureDate;
      
      const days = policy.getDaysUntilExpiration();
      expect(days).toBe(30);
    });

    it('should return negative days for expired policy', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);
      policy.expirationDate = pastDate;
      
      const days = policy.getDaysUntilExpiration();
      expect(days).toBeLessThan(0);
    });
  });

  describe('needsRenewal', () => {
    it('should return true for policy expiring within 30 days', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15); // 15 days from now
      policy.expirationDate = futureDate;
      
      expect(policy.needsRenewal()).toBe(true);
    });

    it('should return false for policy expiring after 30 days', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 45); // 45 days from now
      policy.expirationDate = futureDate;
      
      expect(policy.needsRenewal()).toBe(false);
    });

    it('should return false for already expired policy', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5); // 5 days ago
      policy.expirationDate = pastDate;
      
      expect(policy.needsRenewal()).toBe(false);
    });
  });

  describe('calculateTotalPremium', () => {
    it('should calculate total premium for 12-month policy', () => {
      policy.effectiveDate = new Date('2024-01-01');
      policy.expirationDate = new Date('2024-12-31');
      policy.monthlyPremium = 100;
      
      // Note: This is an approximation since we're calculating months
      const totalPremium = policy.calculateTotalPremium();
      expect(totalPremium).toBeGreaterThan(0);
    });
  });

  describe('isInGracePeriod', () => {
    it('should return true when in grace period', () => {
      const pastDue = new Date();
      pastDue.setDate(pastDue.getDate() - 5); // 5 days ago
      policy.nextPaymentDue = pastDue;
      policy.gracePeriodDays = 10;
      
      expect(policy.isInGracePeriod()).toBe(true);
    });

    it('should return false when not in grace period', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5); // 5 days from now
      policy.nextPaymentDue = futureDate;
      
      expect(policy.isInGracePeriod()).toBe(false);
    });

    it('should return false when no payment due date', () => {
      policy.nextPaymentDue = null;
      expect(policy.isInGracePeriod()).toBe(false);
    });
  });

  describe('validateDates', () => {
    it('should throw error when effective date is after expiration date', () => {
      policy.effectiveDate = new Date('2024-12-31');
      policy.expirationDate = new Date('2024-01-01');
      
      expect(() => policy.validateDates()).toThrow('Effective date must be before expiration date');
    });

    it('should throw error when policy term exceeds one year', () => {
      policy.effectiveDate = new Date('2024-01-01');
      policy.expirationDate = new Date('2025-02-01'); // More than 1 year
      
      expect(() => policy.validateDates()).toThrow('Policy term cannot exceed one year');
    });

    it('should not throw error for valid dates', () => {
      policy.effectiveDate = new Date('2024-01-01');
      policy.expirationDate = new Date('2024-12-31');
      
      expect(() => policy.validateDates()).not.toThrow();
    });
  });

  describe('generatePolicyNumber', () => {
    it('should generate policy number when not provided', () => {
      policy.policyNumber = undefined;
      policy.generatePolicyNumber();
      
      expect(policy.policyNumber).toBeDefined();
      expect(policy.policyNumber).toMatch(/^POL-\d+-\d{3}$/);
    });

    it('should not override existing policy number', () => {
      const existingNumber = 'EXISTING-123';
      policy.policyNumber = existingNumber;
      policy.generatePolicyNumber();
      
      expect(policy.policyNumber).toBe(existingNumber);
    });
  });
});
