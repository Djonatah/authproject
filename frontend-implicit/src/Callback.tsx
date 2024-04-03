import { useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthProvider";

export function Callback() {
  const { hash } = useLocation();
  const { login, auth } = useContext(AuthContext);
  const navigate = useNavigate();
  useEffect(() => {
    if (auth) {
      navigate("/login");
      return;
    }

    const params = new URLSearchParams(hash.replace("#", ""));
    const accessToken = params.get("access_token") as string;
    const idToken = params.get("id_token") as string;
    const state = params.get("state") as string;

    if (!accessToken || !idToken || !state) {
      navigate("/login");
    }

    login(accessToken, idToken, state);
    console.log("all good");
  }, [hash, login, auth]);
  return <div className="ballback">Loading...</div>;
}
