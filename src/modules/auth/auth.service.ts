import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
// bcrypt is used in User entity for password hashing
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../shared/entities';
import { UserRole } from '../../shared/enums';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(
    registerDto: RegisterDto,
  ): Promise<{ user: User; tokens: any }> {
    const { email, password, firstName, lastName, phone, role } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create new user
    const user = this.userRepository.create({
      email,
      password,
      firstName,
      lastName,
      phone,
      role: role || UserRole.CUSTOMER,
      emailVerificationToken: uuidv4(),
    });

    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Remove sensitive data
    const {
      password: userPassword,
      emailVerificationToken,
      ...userWithoutSensitiveData
    } = user;

    return { user: userWithoutSensitiveData as User, tokens };
  }

  async login(loginDto: LoginDto): Promise<{ user: User; tokens: any }> {
    const { email, password } = loginDto;

    // Find user with password
    const user = await this.userRepository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'password',
        'firstName',
        'lastName',
        'role',
        'isActive',
      ],
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.userRepository.update(user.id, { lastLoginAt: new Date() });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Remove sensitive data
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword as User, tokens };
  }

  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<{ tokens: any }> {
    const { refreshToken } = refreshTokenDto;

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user);
      return { tokens };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'password',
        'firstName',
        'lastName',
        'role',
        'isActive',
      ],
    });

    if (user && user.isActive && (await user.validatePassword(password))) {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    }

    return null;
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  private async generateTokens(user: User): Promise<any> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.configService.get<string>('JWT_EXPIRATION'),
    };
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if user exists
      return;
    }

    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await this.userRepository.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    });

    // TODO: Send email with reset token
    // await this.emailService.sendPasswordResetEmail(user.email, resetToken);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: {
        passwordResetToken: token,
      },
    });

    if (
      !user ||
      !user.passwordResetExpires ||
      user.passwordResetExpires < new Date()
    ) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await this.userRepository.save(user);
  }
}
