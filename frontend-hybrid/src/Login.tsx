import { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthProvider";

export function Login() {
  const { auth, makeLoginUrl } = useContext(AuthContext);

  useEffect(() => {
    if (!auth) {
      window.location.href = makeLoginUrl();
    }
  }, [auth]);

  return auth ? <Navigate to="/admin" /> : <div className="login">Loading</div>;
}
