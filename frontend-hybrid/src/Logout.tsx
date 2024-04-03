import { useContext, useEffect } from "react";
import { AuthContext } from "./AuthProvider";

export function Logout() {
  const { makeLogoutUrl } = useContext(AuthContext);

  useEffect(() => {
    const logoutRedirectURL = makeLogoutUrl();
    if (!logoutRedirectURL) return;
    window.location.href = logoutRedirectURL;
  }, [makeLogoutUrl]);

  return <div className="logout">Loading...</div>;
}
