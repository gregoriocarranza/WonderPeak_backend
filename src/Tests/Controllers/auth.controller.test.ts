import { AuthController } from '../../Controller/auth/auth.controller';
import { AuthService } from '../../Services/auth/auth.service';
import { UserService } from '../../Services/User/user.service';
import { RegisterDTO } from '../../dto/input/register.dto';
import { inputValidator } from '../../utils/inputValidator';

jest.mock('../../Services/User/user.service');
jest.mock('../../Services/auth/auth.service');
jest.mock('../../utils/inputValidator');

describe('AuthController - register', () => {
  let authController: AuthController;
  let userService: jest.Mocked<UserService>;
  let authService: jest.Mocked<AuthService>;
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    userService = new UserService() as jest.Mocked<UserService>;
    authService = new AuthService() as jest.Mocked<AuthService>;
    authController = new AuthController();

    req = {
      body: {
        email: 'test@example.com',
        name: 'Test',
        lastname: 'User',
        password: 'password123',
      },
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it('should register a user successfully', async () => {
    (inputValidator as jest.Mock).mockResolvedValue({ success: true });

    userService.getByEmail.mockResolvedValue(null);
    userService.getByFirsName.mockResolvedValue(null);
    authService.createUser.mockResolvedValue({
      result: { user_id: 'auth0Id' },
    });
    userService.create.mockResolvedValue({
      userUuid: 'user-uuid',
      name: 'Test',
      lastname: 'User',
      nickname: 'testuser',
      email: 'test@example.com',
      profileImage: 'http://example.com/profile.jpg',
      coverImage: 'http://example.com/cover.jpg',
      description: '',
      gender: 'male',
      gamificationLevel: 1,
      active: true,
      auth0Id: 'auth0Id',
      pushToken: '',
    });

    await authController.register(req, res, next);

    expect(inputValidator).toHaveBeenCalledWith({
      image: null,
      email: 'test@example.com',
      name: 'Test',
      lastName: 'User',
      password: 'password123',
    });

    expect(userService.getByEmail).toHaveBeenCalledWith('test@example.com');
    expect(userService.getByFirsName).toHaveBeenCalledWith('Test');
    expect(authService.createUser).toHaveBeenCalledWith({
      username: 'Test',
      email: 'test@example.com',
      password: 'password123',
    });
    expect(userService.create).toHaveBeenCalledWith(expect.any(Object));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'User created, go to your inbox to confirm the email',
    });
  });

  it('should handle validation errors', async () => {
    (inputValidator as jest.Mock).mockResolvedValue({
      success: false,
      message: 'Param email is missing',
    });

    await authController.register(req, res, next);

    expect(inputValidator).toHaveBeenCalledWith(expect.any(RegisterDTO));
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('should handle existing user error', async () => {
    userService.getByEmail.mockResolvedValue({} as any);
    userService.getByFirsName.mockResolvedValue({} as any);

    await authController.register(req, res, next);

    expect(userService.getByEmail).toHaveBeenCalledWith('test@example.com');
    expect(userService.getByFirsName).toHaveBeenCalledWith('Test');
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].statusCode).toBe(409);
  });

  it('should handle error during Auth0 user creation', async () => {
    (inputValidator as jest.Mock).mockResolvedValue({ success: true });
    userService.getByEmail.mockResolvedValue(null);
    userService.getByFirsName.mockResolvedValue(null);
    authService.createUser.mockRejectedValue(new Error('Auth0 Error'));

    await authController.register(req, res, next);

    expect(authService.createUser).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should handle error during user creation in the system', async () => {
    (inputValidator as jest.Mock).mockResolvedValue({ success: true });
    userService.getByEmail.mockResolvedValue(null);
    userService.getByFirsName.mockResolvedValue(null);
    authService.createUser.mockResolvedValue({
      result: { user_id: 'auth0Id' },
    });
    userService.create.mockResolvedValue(null);

    await authController.register(req, res, next);

    expect(userService.create).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
