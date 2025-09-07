import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Vehicle } from './vehicle.entity';
import { Quote } from './quote.entity';
import { PolicyStatus } from '../enums';

@Entity('policies')
export class Policy extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  policyNumber: string;

  @Column({
    type: 'enum',
    enum: PolicyStatus,
    default: PolicyStatus.PENDING,
  })
  status: PolicyStatus;

  @Column({ type: 'date' })
  effectiveDate: Date;

  @Column({ type: 'date' })
  expirationDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  premiumAmount: number;

  @Column({ type: 'varchar', length: 50 })
  paymentFrequency: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
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
}
