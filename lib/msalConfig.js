"use client";

import { PublicClientApplication } from "@azure/msal-browser";

const getRedirectUri = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return process.env.NEXT_PUBLIC_REDIRECT_URI || "http://localhost:3000";
};

export const msalConfig = {
  auth: {
    clientId:
      process.env.NEXT_PUBLIC_AZURE_CLIENT_ID ||
      "00000000-0000-0000-0000-000000000000",
    authority: `https://login.microsoftonline.com/${
      process.env.NEXT_PUBLIC_AZURE_TENANT_ID || "common"
    }`,
    redirectUri: getRedirectUri(),
    postLogoutRedirectUri: getRedirectUri(),
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie:
      typeof window !== "undefined" &&
      window.navigator.userAgent.includes("MSIE"),
  },
};

export const loginRequest = {
  scopes: ["User.Read", "openid", "profile"],
  prompt: "select_account",
};

export const apiRequest = {
  scopes: [`${process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || ""}/.default`],
};

export const createMsalInstance = () => new PublicClientApplication(msalConfig);
