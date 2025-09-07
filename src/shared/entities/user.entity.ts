import { Entity, Column, Index, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcryptjs';
import { BaseEntity } from './base.entity';
import { UserRole } from '../enums';

@Entity('users')
@Index(['email'], { unique: true })
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  @Exclude()
  password: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  zipCode: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  country: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  licenseNumber: string;

  @Column({ type: 'date', nullable: true })
  licenseExpiryDate: Date;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Exclude()
  emailVerificationToken?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Exclude()
  passwordResetToken?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  passwordResetExpires?: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastLoginAt: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
