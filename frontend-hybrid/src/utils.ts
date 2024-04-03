import Cookies from "js-cookie";
import { decodeJwt } from "jose";

export function getLoginURL() {
  var nonce = Math.random().toString();
  var state = Math.random().toString();

  Cookies.set("nonce", nonce);
  Cookies.set("state", state);

  const urlParams = new URLSearchParams({
    client_id: "test-dj-client",
    redirect_uri: "http://localhost:3000/callback",
    response_type: "token id_token code",
    // scope: "openid",
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
  Cookies.remove("refresh_token");

  return `http://localhost:8080/realms/test-dj-realm/protocol/openid-connect/logout?${urlParams.toString()}`;
}

export function login(
  accessToken: string,
  idToken?: string | null,
  state?: string | null,
  refresh_token?: string
) {
  const stateCookie = Cookies.get("state");
  const nonceCookie = Cookies.get("nonce");

  if (state && stateCookie !== state) {
    throw new Error("Invalid state");
  }

  let decodedAccessToken = decodeJwt(accessToken);
  let docodedRefreshToken = null;
  let decodedIdToken = null;

  if (idToken) {
    decodedIdToken = decodeJwt(idToken);
  }

  if (refresh_token) {
    decodedAccessToken = decodeJwt(refresh_token);
  }

  if (nonceCookie !== decodedAccessToken.nonce) {
    throw new Error("Invalid nonce");
  }

  if (docodedRefreshToken && nonceCookie !== decodedAccessToken.nonce) {
    throw new Error("Invalid nonce");
  }

  Cookies.set("access_token", accessToken);
  if (idToken) {
    Cookies.set("id_token", idToken);
  }
  if (refresh_token) {
    Cookies.set("refresh_token", refresh_token);
  }
  return decodedAccessToken;
}

export function getAuth() {
  const accessToken = Cookies.get("access_token");
  if (!accessToken) {
    return null;
  }
  return decodeJwt(accessToken);
}

export function exchangeCodeForToken(code: string) {
  // const nonceVal: Cookies.get("nonce") as string;

  const params = new URLSearchParams({
    client_id: "test-dj-client",
    grant_type: "authorization_code",
    code: code,
    redirect_uri: "http://localhost:3000/callback",
    nonce: Cookies.get("nonce") as string,
  });

  return fetch(
    "http://localhost:8080/realms/test-dj-realm/protocol/openid-connect/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    }
  )
    .then((res) => res.json())
    .then((res) => {
      return login(res.access_token, null, null, res.refresh_token);
    });
}
