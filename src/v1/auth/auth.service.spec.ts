import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AppHelperService } from '../helper/app-helper.service';
import { ExceptionMessageConstant } from '../../../../constant/exception-message.constant';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { ResponseData } from '../../../types/response.interface';
import { UserType } from '../../../enums/user-type.enum';
import { SetPasswordDto } from './dto/set-password.dto';

describe('AuthService', () => {
  let authService: AuthService;
  const mockUserService = {
    findByEmployeeId: jest.fn(),
    create: jest.fn(),
    reSendEmail: jest.fn(),
    setPassword: jest.fn(),
  };
  const mockJwtService = {};
  const mockUpdateRefreshToken = jest.fn();
  const mockComparePassword = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();
    authService = module.get<AuthService>(AuthService);
    AppHelperService.comparePassword = mockComparePassword;
  });

  describe('login', () => {
    it('should return access and refresh token for valid login credentials', async () => {
      mockUserService.findByEmployeeId.mockReturnValue({
        content: {
          id: 1,
          isSetPassword: true,
          status: 'active',
          email: 'test@example.com',
          password: '12345',
        },
        status: HttpStatus.OK,
      });
      mockComparePassword.mockReturnValue(true);
      const mockGetTokens = jest.fn().mockReturnValue({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
      authService.getTokens = mockGetTokens;
      authService.updateRefreshToken = mockUpdateRefreshToken;
      const result = await authService.login({
        employeeNo: 1,
        password: '12345',
      });
      expect(result).toEqual({
        content: {
          email: 'test@example.com',
          access_token: 'accessToken',
          refresh_token: 'refreshToken',
        },
        status: HttpStatus.OK,
      });
      expect(mockGetTokens).toHaveBeenCalled();
      expect(mockUpdateRefreshToken).toHaveBeenCalled();
      expect(mockComparePassword).toHaveBeenCalled();
    });
    it('should return error message for user with unset password', async () => {
      mockUserService.findByEmployeeId.mockReturnValue({
        content: {
          id: 1,
          isSetPassword: false,
          status: 'active',
          email: 'test@example.com',
          password: '12345',
        },
        status: HttpStatus.OK,
      });
      const result = await authService.login({
        employeeNo: 1,
        password: '12345',
      });
      expect(result).toEqual({
        content: {
          message: 'Please set your password and try again.',
        },
        status: HttpStatus.FORBIDDEN,
      });
    });
    it('should return not found error if employee no is wrong', async () => {
      mockUserService.findByEmployeeId.mockReturnValue({
        status: HttpStatus.NOT_FOUND,
        content: {
          message: 'User not found',
        },
      });
      const result = await authService.login({
        employeeNo: 1,
        password: '12345',
      });
      expect(result).toEqual({
        status: HttpStatus.NOT_FOUND,
        content: {
          message: 'User not found',
        },
      });
    });
    it('should return an unauthenticated error message if password is wrong', async () => {
      mockUserService.findByEmployeeId.mockReturnValue({
        content: {
          id: 1,
          isSetPassword: true,
          status: 'active',
          email: 'test@example.com',
          password: '12345',
        },
        status: HttpStatus.OK,
      });
      mockComparePassword.mockReturnValue(false);
      const result = await authService.login({
        employeeNo: 1,
        password: '12345',
      });
      expect(result).toEqual({
        status: HttpStatus.UNAUTHORIZED,
        content: { message: 'Invalid password' },
      });
      expect(mockComparePassword).toHaveBeenCalled();
    });
    it('should return an error if user is inactive', async () => {
      mockUserService.findByEmployeeId.mockReturnValue({
        content: {
          id: 1,
          isSetPassword: true,
          status: 'inactive',
          email: 'test@example.com',
          password: '12345',
        },
        status: HttpStatus.OK,
      });
      const result = await authService.login({
        employeeNo: 1,
        password: '12345',
      });
      expect(result).toEqual({
        status: HttpStatus.UNAUTHORIZED,
        content: { message: ExceptionMessageConstant.INACTIVE_USER },
      });
    });
    it('should throw Http Exception', async () => {
      mockUserService.findByEmployeeId.mockRejectedValueOnce(
        new Error('Exception thrown.'),
      );
      try {
        await authService.login({
          employeeNo: 1,
          password: '12345',
        });
        expect(true).toBe(false);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.status).toBe(HttpStatus.BAD_REQUEST);
        expect(err.message).toBe('Exception thrown.');
      }
    });
  });
  describe('register', () => {
    const userId = 123;
    const createUserDto: CreateUserDto = {
      email: 'example@example.com',
      sign: 'dummy-sign',
      stamp: 'dummy-stamp',
      initials: 'dummy-initials',
      firstName: 'John',
      category: UserType.ACTIVE,
      lastName: 'Doe',
      employeeType: 'performing_personnel',
      isAssignAllSections: true,
      employeeNo: 12345,
      sections: [1, 2, 3],
      roles: [4, 5, 6],
      titleIds: [7, 8, 9],
      permissions: [10, 11, 12],
      locationId: 789,
    };
    it('should create a new user and return ResponseData', async () => {
      const expectedResponse: ResponseData = {
        status: HttpStatus.CREATED,
        content: {
          message: 'User created successfully',
        },
      };
      mockUserService.create.mockReturnValue(expectedResponse);
      const result = await authService.register(userId, createUserDto);
      expect(result).toEqual(expectedResponse);
    });
    it('should throw HttpException with BAD_REQUEST when UserService throws an error', async () => {
      const errorMessage = 'User creation failed.';
      mockUserService.create.mockRejectedValueOnce(new Error(errorMessage));
      try {
        await authService.register(userId, createUserDto);
        expect(true).toBe(false);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.status).toBe(HttpStatus.BAD_REQUEST);
        expect(err.message).toBe(errorMessage);
      }
    });
    // it('should return an error message when email is duplicated', async () => {
    //   const expectedResponse: ResponseData = {
    //     status: HttpStatus.CONFLICT,
    //     content: {
    //       message: 'Email already exists',
    //     },
    //   };
    //   mockUserService.create.mockRejectedValue(expectedResponse);
    //   try {
    //     await authService.register(userId, createUserDto);
    //     expect(true).toBe(false);
    //   } catch (err) {
    //
    //   }
    // });
    // it('should return an error message when employeeNo is duplicated', async () => {
    //   const errorMessage = 'Employee No already exists';
    //   mockUserService.create.mockRejectedValue(new Error(errorMessage));
    //   try {
    //     await authService.register(userId, createUserDto);
    //     expect(true).toBe(false);
    //   } catch (err) {
    //     expect(err).toBeInstanceOf(HttpException);
    //     expect(err.status).toBe(HttpStatus.CONFLICT);
    //     expect(err.message).toBe(errorMessage);
    //   }
    // });
  });
  describe('reSendEmail', () => {
    const userId = 123;
    it('should resend the email and return ResponseData', async () => {
      const expectedResponse: ResponseData = {
        status: HttpStatus.OK,
        content: {
          message: 'Email sent successfully.',
        },
      };
      mockUserService.reSendEmail.mockReturnValue(expectedResponse);
      const result = await authService.reSendEmail(userId);
      expect(result).toEqual(expectedResponse);
    });
    it('should throw HttpException with BAD_REQUEST when UserService throws an error', async () => {
      const errorMessage = 'User creation failed.';
      mockUserService.reSendEmail.mockRejectedValueOnce(
        new Error(errorMessage),
      );
      try {
        await authService.reSendEmail(userId);
        expect(true).toBe(false);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.status).toBe(HttpStatus.BAD_REQUEST);
        expect(err.message).toBe(errorMessage);
      }
    });
  });
  describe('setPassword', () => {
    it('should set a new password and return ResponseData', async () => {
      const token = 'valid_token';
      const setPasswordDto: SetPasswordDto = {
        newPassword: 'new_password',
      };

      const expectedResponse: ResponseData = {
        status: HttpStatus.OK,
        content: {
          message: 'Password set successfully',
        },
      };

      mockUserService.setPassword.mockResolvedValueOnce(expectedResponse);
      const result = await authService.setPassword(token, setPasswordDto);
      expect(result).toEqual(expectedResponse);
    });
    it('should throw HttpException with BAD_REQUEST when UserService throws an error', async () => {
      // Arrange
      const token = 'invalid_token';
      const setPasswordDto: SetPasswordDto = {
        newPassword: 'new_password',
      };

      const errorMessage = 'Password setting failed.';
      mockUserService.setPassword.mockRejectedValueOnce(
        new Error(errorMessage),
      );
      try {
        await authService.setPassword(token, setPasswordDto);
        expect(true).toBe(false);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.status).toBe(HttpStatus.BAD_REQUEST);
        expect(err.message).toBe(errorMessage);
      }
    });
  });
});
