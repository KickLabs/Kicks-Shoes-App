import { useSelector } from "react-redux";
import { RootState } from "../store";

export const useAuth = () => {
  const { user, token, loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const isAuthenticated = !!(user && token);

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
  };
};
