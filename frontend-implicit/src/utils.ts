import Cookies from "../node_modules/@types/js-cookie";
import { decodeJwt } from "jose";

export function getLoginURL() {
  var nonce = Math.random.toString();
  var state = Math.random.toString();

  Cookies.set("nonce", nonce);
  Cookies.set("state", state);

  const urlParams = new URLSearchParams({
    client_id: "test-dj-client",
    redirect_uri: "http://localhost:3000/callback",
    response_type: "token id_token",
    scope: "openid",
    nonce: nonce,
    state: state,
  });

  return `http://localhost:8080/realms/test-dj-realm/protocol/openid-connect/auth?${urlParams.toString()}`;
}

export function getLogoutURL() {
  if (!Cookies.get("id_token")) {
    return null;
  }

  const urlParams = new URLSearchParams({
    id_token_hint: Cookies.get("id_token") as string,
    post_logout_redirect_uri: "http://localhost:3000/login",
  });

  Cookies.remove("nonce");
  Cookies.remove("state");
  Cookies.remove("id_token");
  Cookies.remove("access_token");

  return `http://localhost:8080/realms/test-dj-realm/protocol/openid-connect/logout?${urlParams.toString()}`;
}

export function login(accessToken: string, idToken: string, state: string) {
  const stateCookie = Cookies.get("state");
  const nonceCookie = Cookies.get("nonce");

  if (stateCookie !== state) {
    throw new Error("Invalid state");
  }

  const decodedAccessToken = decodeJwt(accessToken);
  const decodedIdToken = decodeJwt(idToken);

  if (nonceCookie !== decodedAccessToken.nonce) {
    throw new Error("Invalid nonce");
  }

  Cookies.set("access_token", accessToken);
  Cookies.set("id_token", idToken);

  return decodedAccessToken;
}

export function getAuth() {
  const accessToken = Cookies.get("access_token");
  if (!accessToken) {
    return null;
  }
  return decodeJwt(accessToken);
}
