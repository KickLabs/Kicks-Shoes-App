import axios from "./axios.customize";

export const registerAPI = (email: string, password: string, name: string) => {
  const url = `/api/v1/auth/register`;
  return axios.post<IBackendRes<IRegister>>(url, { name, email, password });
};

export const verifyCodeAPI = (email: string, code: string) => {
  const url = `/api/v1/auth/verify-code`;
  return axios.post<IBackendRes<IRegister>>(url, { email, code });
};

export const resendCodeAPI = (email: string) => {
  const url = `/api/v1/auth/verify-email`;
  return axios.post<IBackendRes<IRegister>>(url, { email });
};

export const loginAPI = (email: string, password: string) => {
  const url = `/api/auth/login`;
  return axios.post<IBackendRes<IUserLogin>>(url, { email, password });
};
