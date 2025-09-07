import { User } from '../../src/shared/entities/user.entity';
import { UserRole } from '../../src/shared/enums';

export const createUserFixture = (overrides: Partial<User> = {}): User => {
  const user = new User();

  user.id = 'test-user-id';
  user.firstName = 'John';
  user.lastName = 'Doe';
  user.email = 'john.doe@example.com';
  user.password = 'hashedPassword123';
  user.phone = '+1234567890';
  user.role = UserRole.CUSTOMER;
  user.isEmailVerified = false;
  user.isActive = true;
  user.createdAt = new Date('2023-01-01');
  user.updatedAt = new Date('2023-01-01');

  return Object.assign(user, overrides);
};

export const createCustomerFixture = (overrides: Partial<User> = {}): User => {
  return createUserFixture({
    role: UserRole.CUSTOMER,
    ...overrides,
  });
};

export const createAgentFixture = (overrides: Partial<User> = {}): User => {
  return createUserFixture({
    id: 'test-agent-id',
    firstName: 'Jane',
    lastName: 'Agent',
    email: 'jane.agent@example.com',
    role: UserRole.AGENT,
    ...overrides,
  });
};

export const createAdminFixture = (overrides: Partial<User> = {}): User => {
  return createUserFixture({
    id: 'test-admin-id',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
    ...overrides,
  });
};

export const userFixtures = {
  validCustomer: createCustomerFixture(),
  validAgent: createAgentFixture(),
  validAdmin: createAdminFixture(),
  inactiveUser: createUserFixture({ isActive: false }),
  unverifiedUser: createUserFixture({ isEmailVerified: false }),
};
