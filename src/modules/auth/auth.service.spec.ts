import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { AuthService } from './auth.service';
import { User } from '../../shared/entities/user.entity';
import { UserRole } from '../../shared/enums';
import { createMockRepository } from '../../../test/mocks/repository.mock';
import { mockJwtService, mockConfigService } from '../../../test/mocks/jwt.mock';
import { userFixtures } from '../../../test/fixtures/user.fixtures';

// Mock bcrypt
jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: any;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'TestPassword123!',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.CUSTOMER,
    };

    it('should successfully register a new user', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);
      const createdUser = userFixtures.validCustomer;
      userRepository.create.mockReturnValue(createdUser);
      userRepository.save.mockResolvedValue(createdUser);
      mockJwtService.signAsync.mockResolvedValue('mock-access-token');

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: registerDto.email } });
      expect(userRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        role: registerDto.role,
      }));
      expect(userRepository.save).toHaveBeenCalledWith(createdUser);
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.tokens).toHaveProperty('accessToken');
      expect(result.tokens).toHaveProperty('refreshToken');
    });

    it('should throw ConflictException if user already exists', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(userFixtures.validCustomer);

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: registerDto.email } });
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should set default role to CUSTOMER if not provided', async () => {
      // Arrange
      const registerDtoWithoutRole = { ...registerDto };
      delete registerDtoWithoutRole.role;
      userRepository.findOne.mockResolvedValue(null);
      const createdUser = userFixtures.validCustomer;
      userRepository.create.mockReturnValue(createdUser);
      userRepository.save.mockResolvedValue(createdUser);

      // Act
      await service.register(registerDtoWithoutRole);

      // Assert
      expect(userRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        role: UserRole.CUSTOMER,
      }));
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'TestPassword123!',
    };

    it('should successfully login with valid credentials', async () => {
      // Arrange
      const user = userFixtures.validCustomer;
      user.validatePassword = jest.fn().mockResolvedValue(true);
      userRepository.findOne.mockResolvedValue(user);
      userRepository.update.mockResolvedValue({ affected: 1 });

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
        select: ['id', 'email', 'password', 'firstName', 'lastName', 'role', 'isActive'],
      });
      expect(user.validatePassword).toHaveBeenCalledWith(loginDto.password);
      expect(userRepository.update).toHaveBeenCalledWith(user.id, { lastLoginAt: expect.any(Date) });
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      // Arrange
      const user = userFixtures.validCustomer;
      user.validatePassword = jest.fn().mockResolvedValue(false);
      userRepository.findOne.mockResolvedValue(user);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      // Arrange
      const inactiveUser = userFixtures.inactiveUser;
      userRepository.findOne.mockResolvedValue(inactiveUser);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    const refreshTokenDto = { refreshToken: 'valid-refresh-token' };

    it('should successfully refresh tokens', async () => {
      // Arrange
      const payload = { sub: 'test-user-id', email: 'test@example.com' };
      mockJwtService.verify.mockReturnValue(payload);
      userRepository.findOne.mockResolvedValue(userFixtures.validCustomer);

      // Act
      const result = await service.refreshToken(refreshTokenDto);

      // Assert
      expect(mockJwtService.verify).toHaveBeenCalledWith(refreshTokenDto.refreshToken, {
        secret: 'test-refresh-secret',
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: payload.sub } });
      expect(result).toHaveProperty('tokens');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      // Arrange
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      // Arrange
      const payload = { sub: 'non-existent-user-id', email: 'test@example.com' };
      mockJwtService.verify.mockReturnValue(payload);
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('should return user for valid credentials', async () => {
      // Arrange
      const user = userFixtures.validCustomer;
      user.validatePassword = jest.fn().mockResolvedValue(true);
      userRepository.findOne.mockResolvedValue(user);

      // Act
      const result = await service.validateUser('test@example.com', 'password');

      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe(user.email);
    });

    it('should return null for invalid credentials', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.validateUser('invalid@example.com', 'password');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return user if found', async () => {
      // Arrange
      const user = userFixtures.validCustomer;
      userRepository.findOne.mockResolvedValue(user);

      // Act
      const result = await service.findById('test-user-id');

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 'test-user-id' } });
      expect(result).toBe(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('forgotPassword', () => {
    it('should handle forgot password for existing user', async () => {
      // Arrange
      const user = userFixtures.validCustomer;
      userRepository.findOne.mockResolvedValue(user);
      userRepository.update.mockResolvedValue({ affected: 1 });

      // Act
      await service.forgotPassword('test@example.com');

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(userRepository.update).toHaveBeenCalledWith(user.id, expect.objectContaining({
        passwordResetToken: expect.any(String),
        passwordResetExpires: expect.any(Date),
      }));
    });

    it('should silently handle non-existent email', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act
      await service.forgotPassword('nonexistent@example.com');

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: 'nonexistent@example.com' } });
      expect(userRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should successfully reset password with valid token', async () => {
      // Arrange
      const user = userFixtures.validCustomer;
      user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour from now
      userRepository.findOne.mockResolvedValue(user);
      userRepository.save.mockResolvedValue(user);

      // Act
      await service.resetPassword('valid-token', 'NewPassword123!');

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { passwordResetToken: 'valid-token' },
      });
      expect(userRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        password: 'NewPassword123!',
        passwordResetToken: undefined,
        passwordResetExpires: undefined,
      }));
    });

    it('should throw BadRequestException for invalid token', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.resetPassword('invalid-token', 'NewPassword123!')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for expired token', async () => {
      // Arrange
      const user = userFixtures.validCustomer;
      user.passwordResetExpires = new Date(Date.now() - 3600000); // 1 hour ago
      userRepository.findOne.mockResolvedValue(user);

      // Act & Assert
      await expect(service.resetPassword('expired-token', 'NewPassword123!')).rejects.toThrow(BadRequestException);
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', async () => {
      // Arrange
      const user = userFixtures.validCustomer;
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      // Act
      const result = await (service as any).generateTokens(user);

      // Assert
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: '15m',
      });
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
    });
  });
});
