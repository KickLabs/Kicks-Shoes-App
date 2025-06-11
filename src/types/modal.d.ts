export {};

declare global {
  interface IBackendRes<T> {
    error?: string | string[];
    message: string | string[];
    statusCode: number | string;
    data?: T; // data chỉ có khi thành công
  }

  interface IRegister {
    _id: string;
    email: string;
    password: string;
    confirmPassword: string;
  }

  interface IUserLogin {
    user: {
      email: string;
      _id: string;
      name: string;
      role: string;
      address: any;
      avatar: string;
      phone: string;
    };
    tokens: {
      access_token: string;
      refresh_token: string;
    };
  }
}
