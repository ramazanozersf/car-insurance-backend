import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { IsNotEmpty, IsEnum, IsNumber, IsDate, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Vehicle } from './vehicle.entity';
import { Quote } from './quote.entity';
import { PolicyStatus } from '../enums';

@Entity('policies')
export class Policy extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  @IsNotEmpty({ message: 'Policy number is required' })
  policyNumber: string;

  @Column({
    type: 'enum',
    enum: PolicyStatus,
    default: PolicyStatus.PENDING,
  })
  @IsEnum(PolicyStatus, { message: 'Invalid policy status' })
  status: PolicyStatus;

  @Column({ type: 'date' })
  @IsDate({ message: 'Effective date must be a valid date' })
  @Transform(({ value }) => value instanceof Date ? value : new Date(value as string))
  effectiveDate: Date;

  @Column({ type: 'date' })
  @IsDate({ message: 'Expiration date must be a valid date' })
  @Transform(({ value }) => value instanceof Date ? value : new Date(value as string))
  expirationDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Premium amount must be a valid number' })
  @Min(0, { message: 'Premium amount must be positive' })
  @Max(999999.99, { message: 'Premium amount exceeds maximum limit' })
  premiumAmount: number;

  @Column({ type: 'varchar', length: 50 })
  @IsNotEmpty({ message: 'Payment frequency is required' })
  paymentFrequency: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Monthly premium must be a valid number' })
  @Min(0, { message: 'Monthly premium must be positive' })
  monthlyPremium: number;

  @Column({ type: 'date', nullable: true })
  nextPaymentDue: Date;

  @Column({ type: 'int', default: 0 })
  gracePeriodDays: number;

  @Column({ type: 'jsonb' })
  coverageDetails: any;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  deductible: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  coverageLimit: number;

  @Column({ type: 'date', nullable: true })
  lastPaymentDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  outstandingBalance: number;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string;

  @Column({ type: 'date', nullable: true })
  cancellationDate: Date;

  @Column({ type: 'boolean', default: true })
  autoRenew: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToOne(() => Quote, { eager: false })
  @JoinColumn({ name: 'quoteId' })
  quote: Quote;

  @Column({ type: 'uuid' })
  quoteId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'customerId' })
  customer: User;

  @Column({ type: 'uuid' })
  customerId: string;

  @ManyToOne(() => Vehicle, { eager: false })
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;

  @Column({ type: 'uuid' })
  vehicleId: string;

  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'agentId' })
  agent: User;

  @Column({ type: 'uuid', nullable: true })
  agentId: string;

  // Business Logic Methods

  /**
   * Check if the policy is currently active
   */
  isActive(): boolean {
    const now = new Date();
    return (
      this.status === PolicyStatus.ACTIVE &&
      this.effectiveDate <= now &&
      this.expirationDate > now
    );
  }

  /**
   * Check if the policy is expired
   */
  isExpired(): boolean {
    return new Date() > this.expirationDate;
  }

  /**
   * Check if the policy is in grace period
   */
  isInGracePeriod(): boolean {
    if (!this.nextPaymentDue) return false;
    
    const now = new Date();
    const gracePeriodEnd = new Date(this.nextPaymentDue);
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + this.gracePeriodDays);
    
    return now > this.nextPaymentDue && now <= gracePeriodEnd;
  }

  /**
   * Calculate days until expiration
   */
  getDaysUntilExpiration(): number {
    const now = new Date();
    const timeDiff = this.expirationDate.getTime() - now.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  /**
   * Check if policy needs renewal (within 30 days of expiration)
   */
  needsRenewal(): boolean {
    return this.getDaysUntilExpiration() <= 30 && this.getDaysUntilExpiration() > 0;
  }

  /**
   * Calculate the total premium for the policy term
   */
  calculateTotalPremium(): number {
    const monthsInTerm = this.getTermInMonths();
    return this.monthlyPremium * monthsInTerm;
  }

  /**
   * Get the policy term in months
   */
  private getTermInMonths(): number {
    const startDate = new Date(this.effectiveDate);
    const endDate = new Date(this.expirationDate);
    
    const yearDiff = endDate.getFullYear() - startDate.getFullYear();
    const monthDiff = endDate.getMonth() - startDate.getMonth();
    
    return yearDiff * 12 + monthDiff;
  }

  /**
   * Validate policy dates before insert/update
   */
  @BeforeInsert()
  @BeforeUpdate()
  validateDates(): void {
    if (this.effectiveDate && this.expirationDate) {
      if (this.effectiveDate >= this.expirationDate) {
        throw new Error('Effective date must be before expiration date');
      }
    }

    // Validate that expiration date is not more than 1 year from effective date
    if (this.effectiveDate && this.expirationDate) {
      const oneYearLater = new Date(this.effectiveDate);
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      
      if (this.expirationDate > oneYearLater) {
        throw new Error('Policy term cannot exceed one year');
      }
    }
  }

  /**
   * Generate policy number before insert
   */
  @BeforeInsert()
  generatePolicyNumber(): void {
    if (!this.policyNumber) {
      const timestamp = Date.now().toString();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      this.policyNumber = `POL-${timestamp}-${random}`;
    }
  }
}
