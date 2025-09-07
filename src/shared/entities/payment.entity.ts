import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Policy } from './policy.entity';
import { PaymentStatus } from '../enums';

@Entity('payments')
export class Payment extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  transactionId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ type: 'varchar', length: 50 })
  paymentMethod: string; // credit_card, debit_card, bank_transfer, check

  @Column({ type: 'varchar', length: 100, nullable: true })
  paymentProvider: string; // stripe, paypal, etc.

  @Column({ type: 'varchar', length: 255, nullable: true })
  providerTransactionId: string;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  processedAt: Date;

  @Column({ type: 'varchar', length: 50 })
  paymentType: string; // premium, deductible, fee, refund

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  failureReason: string;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  nextRetryAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'payerId' })
  payer: User;

  @Column({ type: 'uuid' })
  payerId: string;

  @ManyToOne(() => Policy, { eager: false, nullable: true })
  @JoinColumn({ name: 'policyId' })
  policy: Policy;

  @Column({ type: 'uuid', nullable: true })
  policyId: string;
}
