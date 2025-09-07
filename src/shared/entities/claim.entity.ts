import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Policy } from './policy.entity';
import { ClaimStatus } from '../enums';

@Entity('claims')
export class Claim extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  claimNumber: string;

  @Column({
    type: 'enum',
    enum: ClaimStatus,
    default: ClaimStatus.SUBMITTED,
  })
  status: ClaimStatus;

  @Column({ type: 'varchar', length: 100 })
  claimType: string; // collision, comprehensive, liability, etc.

  @Column({ type: 'date' })
  incidentDate: Date;

  @Column({ type: 'date' })
  reportedDate: Date;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  approvedAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  settledAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  deductibleAmount: number;

  @Column({ type: 'boolean', default: false })
  isAtFault: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  policeReportNumber: string;

  @Column({ type: 'jsonb', nullable: true })
  involvedParties: any;

  @Column({ type: 'jsonb', nullable: true })
  witnesses: any;

  @Column({ type: 'text', nullable: true })
  adjusterNotes: string;

  @Column({ type: 'date', nullable: true })
  closedDate: Date;

  @Column({ type: 'text', nullable: true })
  denialReason: string;

  @Column({ type: 'boolean', default: false })
  isFraudulent: boolean;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  fraudScore: number;

  @ManyToOne(() => Policy, { eager: false })
  @JoinColumn({ name: 'policyId' })
  policy: Policy;

  @Column({ type: 'uuid' })
  policyId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'claimantId' })
  claimant: User;

  @Column({ type: 'uuid' })
  claimantId: string;

  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'adjusterId' })
  adjuster: User;

  @Column({ type: 'uuid', nullable: true })
  adjusterId: string;
}
