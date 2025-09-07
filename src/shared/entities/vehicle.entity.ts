import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('vehicles')
@Index(['vin'], { unique: true })
export class Vehicle extends BaseEntity {
  @Column({ type: 'varchar', length: 17, unique: true })
  vin: string;

  @Column({ type: 'varchar', length: 100 })
  make: string;

  @Column({ type: 'varchar', length: 100 })
  model: string;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  trim: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  bodyStyle: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  engineType: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  transmission: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  fuelType: string;

  @Column({ type: 'int', nullable: true })
  mileage: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  color: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  licensePlate: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  registrationState: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  purchasePrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  currentValue: number;

  @Column({ type: 'date', nullable: true })
  purchaseDate: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  usage: string; // personal, business, commercial

  @Column({ type: 'int', nullable: true })
  annualMileage: number;

  @Column({ type: 'boolean', default: false })
  hasAntiTheftDevice: boolean;

  @Column({ type: 'boolean', default: false })
  hasAirbags: boolean;

  @Column({ type: 'boolean', default: false })
  hasABS: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  parkingLocation: string; // garage, driveway, street

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column({ type: 'uuid' })
  ownerId: string;
}
