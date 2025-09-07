import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Vehicle } from './vehicle.entity';

@Entity('quotes')
export class Quote extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  quoteNumber: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  basePremium: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPremium: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercentage: number;

  @Column({ type: 'varchar', length: 50 })
  paymentFrequency: string; // monthly, quarterly, semi-annual, annual

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monthlyPremium: number;

  @Column({ type: 'date' })
  effectiveDate: Date;

  @Column({ type: 'date' })
  expirationDate: Date;

  @Column({ type: 'timestamp with time zone' })
  quoteExpiresAt: Date;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string; // pending, accepted, expired, declined

  @Column({ type: 'jsonb', nullable: true })
  coverageDetails: any;

  @Column({ type: 'jsonb', nullable: true })
  riskFactors: any;

  @Column({ type: 'jsonb', nullable: true })
  discountFactors: any;

  @Column({ type: 'text', nullable: true })
  notes: string;

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
}
