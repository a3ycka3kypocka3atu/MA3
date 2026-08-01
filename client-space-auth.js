(() => {
  'use strict';

  const config = window.CLIENT_SPACE_CONFIG || {};
  const SUPABASE_URL = config.supabaseUrl || '';
  const SUPABASE_PUBLISHABLE_KEY = config.supabasePublishableKey || '';
  const SESSION_KEY = '34forfree7:cabinet-auth:v1';
  const hasAuthConfig = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

  const dom = {
    body: document.body,
    gate: document.getElementById('auth-gate'),
    status: document.getElementById('auth-status'),
    telegramLogin: document.getElementById('telegram-login'),
    googleLogin: document.getElementById('google-login'),
    previewLogin: document.getElementById('preview-login'),
    accountButton: document.getElementById('account-button'),
    accountMenu: document.getElementById('account-menu'),
    accountName: document.getElementById('account-name'),
    accountProvider: document.getElementById('account-provider'),
    logoutButton: document.getElementById('logout-button'),
  };

  function setStatus(message, isError = false) {
    dom.status.textContent = message;
    dom.status.classList.toggle('is-error', isError);
  }

  function readSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch (error) {
      return null;
    }
  }

  function saveSession(payload) {
    const expiresIn = Number(payload.expires_in || 3600);
    const session = {
      accessToken: payload.access_token,
      refreshToken: payload.refresh_token,
      expiresAt: Date.now() + (expiresIn * 1000),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function authHeaders(extra = {}) {
    return {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      ...extra,
    };
  }

  function consumeAuthRedirect() {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const error = params.get('error_description') || params.get('error');

    if (error) {
      window.history.replaceState({}, '', `${window.location.pathname}${window.location.search}`);
      setStatus(decodeURIComponent(error.replace(/\+/g, ' ')), true);
      return null;
    }

    if (!accessToken || !refreshToken) return null;

    const session = saveSession({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: params.get('expires_in'),
    });
    window.history.replaceState({}, '', `${window.location.pathname}${window.location.search}`);
    return session;
  }

  async function refreshSession(session) {
    if (!session?.refreshToken) return null;

    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ refresh_token: session.refreshToken }),
    });

    if (!response.ok) return null;
    return saveSession(await response.json());
  }

  async function getUser(session) {
    if (!session?.accessToken) return null;

    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: authHeaders({ Authorization: `Bearer ${session.accessToken}` }),
    });

    return response.ok ? response.json() : null;
  }

  function displayName(user) {
    const metadata = user.user_metadata || {};
    return metadata.full_name || metadata.name || metadata.username || user.email?.split('@')[0] || 'Client';
  }

  function providerName(user) {
    if (user.user_metadata?.auth_source === 'telegram') return 'Telegram access';
    const provider = user.app_metadata?.provider;
    return provider ? `${provider[0].toUpperCase()}${provider.slice(1)} access` : 'Secure access';
  }

  function showCabinet(user) {
    const name = displayName(user);
    dom.body.classList.remove('auth-loading');
    dom.body.classList.add('is-authenticated');
    dom.gate.setAttribute('aria-hidden', 'true');
    dom.accountName.textContent = name;
    dom.accountProvider.textContent = providerName(user);
    dom.accountButton.textContent = name.trim().charAt(0).toUpperCase() || 'C';
    dom.accountButton.title = name;
  }

  function showLogin(message = 'Choose a secure sign-in method.') {
    dom.body.classList.remove('auth-loading', 'is-authenticated');
    dom.gate.removeAttribute('aria-hidden');
    setStatus(message);
  }

  async function initializeAuth() {
    if (!hasAuthConfig) {
      dom.previewLogin.hidden = false;
      showLogin('Secure login is being activated. You can continue to the prototype for now.');
      return;
    }

    let session = consumeAuthRedirect() || readSession();

    try {
      if (session && session.expiresAt <= Date.now() + 30000) {
        session = await refreshSession(session);
      }

      let user = await getUser(session);
      if (!user && session?.refreshToken) {
        session = await refreshSession(session);
        user = await getUser(session);
      }

      if (user) {
        showCabinet(user);
        return;
      }
    } catch (error) {
      console.warn('Cabinet session check failed.', error);
    }

    clearSession();
    showLogin();
  }

  dom.googleLogin.addEventListener('click', () => {
    if (!hasAuthConfig) {
      setStatus('Google login needs the final secure project setting.', true);
      return;
    }

    const redirectTo = `${window.location.origin}${window.location.pathname}${window.location.search}`;
    const authUrl = new URL(`${SUPABASE_URL}/auth/v1/authorize`);
    authUrl.searchParams.set('provider', 'google');
    authUrl.searchParams.set('redirect_to', redirectTo);
    setStatus('Opening Google…');
    window.location.assign(authUrl.toString());
  });

  dom.telegramLogin.addEventListener('click', (event) => {
    if (hasAuthConfig) return;
    event.preventDefault();
    setStatus('Telegram login needs the final secure project setting.', true);
  });

  dom.previewLogin.addEventListener('click', () => {
    showCabinet({
      user_metadata: { full_name: 'Prototype client' },
      app_metadata: { provider: 'prototype' },
    });
  });

  dom.accountButton.addEventListener('click', () => {
    const isOpen = !dom.accountMenu.hidden;
    dom.accountMenu.hidden = isOpen;
    dom.accountButton.setAttribute('aria-expanded', String(!isOpen));
  });

  dom.logoutButton.addEventListener('click', () => {
    const session = readSession();
    clearSession();
    dom.accountMenu.hidden = true;
    dom.accountButton.setAttribute('aria-expanded', 'false');

    if (session?.accessToken) {
      fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: authHeaders({ Authorization: `Bearer ${session.accessToken}` }),
      }).catch(() => {});
    }

    showLogin('You have signed out.');
  });

  document.addEventListener('click', (event) => {
    if (!dom.accountMenu.hidden && !event.target.closest('#account-menu') && !event.target.closest('#account-button')) {
      dom.accountMenu.hidden = true;
      dom.accountButton.setAttribute('aria-expanded', 'false');
    }
  });

  initializeAuth();
})();
