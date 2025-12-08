"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  MsalProvider,
  useAccount,
  useIsAuthenticated,
  useMsal,
} from "@azure/msal-react";
import {
  createMsalInstance,
  loginRequest,
  apiRequest,
  msalConfig,
} from "@/lib/msalConfig";

const msalInstance = createMsalInstance();

const formatMsalError = (error) => {
  if (!error) return "Unknown authentication error";
  if (typeof error === "string") return error;
  if (error.errorMessage) return error.errorMessage;
  if (error.message) return error.message;
  try {
    return JSON.stringify(error);
  } catch {
    return "Authentication error";
  }
};

// hydrate any existing session before React renders children
const msalInitializationPromise = msalInstance
  .initialize()
  .then(() => {
    const cachedAccounts = msalInstance.getAllAccounts();
    if (cachedAccounts.length && !msalInstance.getActiveAccount()) {
      msalInstance.setActiveAccount(cachedAccounts[0]);
    }
  })
  .catch((error) => {
    console.error("MSAL initialization failed:", error);
    throw error;
  });

const AuthContext = createContext(null);

export const AuthContextProvider = ({ children }) => (
  <MsalProvider instance={msalInstance}>
    <AuthProviderInner>{children}</AuthProviderInner>
  </MsalProvider>
);

const AuthProviderInner = ({ children }) => {
  const { instance, accounts } = useMsal();
  const msalAuthenticated = useIsAuthenticated();
  const hydratedAccount = useAccount(
    instance.getActiveAccount() ?? accounts[0] ?? {}
  );
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const [authError, setAuthError] = useState(null);
  const clearAuthError = useCallback(() => setAuthError(null), []);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        await msalInitializationPromise;
        const redirectResponse = await instance.handleRedirectPromise();
        const activeAccount =
          redirectResponse?.account ??
          instance.getActiveAccount() ??
          instance.getAllAccounts()[0];

        if (activeAccount) {
          instance.setActiveAccount(activeAccount);
        }
      } catch (error) {
        console.error("MSAL redirect handling failed:", error);
        setAuthError(formatMsalError(error));
      } finally {
        if (!cancelled) {
          setInitializing(false);
        }
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [instance]);

  useEffect(() => {
    if (initializing) return;

    setLoading(true);

    const activeAccount =
      instance.getActiveAccount() ?? hydratedAccount ?? accounts[0] ?? null;

    if (activeAccount) {
      if (!instance.getActiveAccount()) {
        instance.setActiveAccount(activeAccount);
      }
      setUser({
        id: activeAccount.localAccountId,
        name: activeAccount.name,
        email: activeAccount.username,
        account: activeAccount,
      });
      clearAuthError();
    } else {
      setUser(null);
    }

    setLoading(false);
  }, [
    initializing,
    msalAuthenticated,
    hydratedAccount,
    accounts,
    instance,
    clearAuthError,
  ]);

  const login = useCallback(async () => {
    setLoading(true);
    clearAuthError();
    try {
      const response = await instance.loginPopup(loginRequest);
      instance.setActiveAccount(response.account);
      setUser({
        id: response.account.localAccountId,
        name: response.account.name,
        email: response.account.username,
        account: response.account,
      });
      clearAuthError();
    } catch (error) {
      console.error("Login failed:", error);
      setAuthError(formatMsalError(error));
    } finally {
      setLoading(false);
    }
  }, [instance, clearAuthError]);

  const loginRedirect = useCallback(async () => {
    setLoading(true);
    clearAuthError();
    try {
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.error("Login redirect failed:", error);
      setAuthError(formatMsalError(error));
      setLoading(false);
    }
  }, [instance, clearAuthError]);

  const logout = useCallback(async () => {
    setLoading(true);
    clearAuthError();
    try {
      await instance.logoutPopup();
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      setAuthError(formatMsalError(error));
    } finally {
      setLoading(false);
    }
  }, [instance, clearAuthError]);

  const logoutRedirect = useCallback(async () => {
    setLoading(true);
    clearAuthError();
    try {
      await instance.logoutRedirect({
        postLogoutRedirectUri:
          typeof window !== "undefined"
            ? window.location.origin
            : msalConfig.auth.postLogoutRedirectUri,
      });
      setUser(null);
    } catch (error) {
      console.error("Logout redirect failed:", error);
      setAuthError(formatMsalError(error));
      setLoading(false);
    }
  }, [instance, clearAuthError]);

  const acquireToken = useCallback(
    async (request) => {
      const activeAccount = instance.getActiveAccount();
      if (!activeAccount) return null;

      try {
        const response = await instance.acquireTokenSilent({
          ...request,
          account: activeAccount,
        });
        return response.accessToken;
      } catch (error) {
        console.warn("Silent token acquisition failed:", error);
        setAuthError(formatMsalError(error));
        try {
          const response = await instance.acquireTokenPopup({
            ...request,
            account: activeAccount,
          });
          return response.accessToken;
        } catch (popupError) {
          console.error("Popup token acquisition failed:", popupError);
          setAuthError(formatMsalError(popupError));
          return null;
        }
      }
    },
    [instance]
  );

  const getAccessToken = useCallback(
    (scopes = loginRequest.scopes) => acquireToken({ scopes }),
    [acquireToken]
  );

  const getApiToken = useCallback(() => acquireToken(apiRequest), [acquireToken]);

  const callApi = useCallback(
    async (url, options = {}) => {
      const token = await getApiToken();
      if (!token) {
        throw new Error("Unable to acquire API token");
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...(options.headers ?? {}),
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error(`API call failed: ${response.status}`);
      }

      return response.json();
    },
    [getApiToken]
  );

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: msalAuthenticated && Boolean(user),
      loading,
      initializing,
      login,
      loginRedirect,
      logout,
      logoutRedirect,
      getAccessToken,
      getApiToken,
      callApi,
      msalInstance: instance,
      hasAccounts:
        Boolean(instance.getActiveAccount()) || accounts.length > 0,
      authError,
      clearAuthError,
    }),
    [
      user,
      msalAuthenticated,
      loading,
      initializing,
      login,
      loginRedirect,
      logout,
      logoutRedirect,
      getAccessToken,
      getApiToken,
      callApi,
      instance,
      accounts,
      authError,
      clearAuthError,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
};
