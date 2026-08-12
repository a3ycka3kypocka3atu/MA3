(() => {
  'use strict';

  const config = window.CLIENT_SPACE_CONFIG || {};
  const SUPABASE_URL = config.supabaseUrl || '';
  const SUPABASE_PUBLISHABLE_KEY = config.supabasePublishableKey || '';
  const SESSION_KEY = 'client-cabinet:auth:v1';
  const LEGACY_SESSION_KEY = '34forfree7:cabinet-auth:v1';
  const LANGUAGE_KEY = 'client-cabinet:language:v1';
  const LEGACY_LANGUAGE_KEY = '34forfree7:client-space:language:v1';
  const hasAuthConfig = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
  const translations = window.CLIENT_SPACE_I18N?.ru || {};
  const savedLanguage = localStorage.getItem(LANGUAGE_KEY) || localStorage.getItem(LEGACY_LANGUAGE_KEY);
  const language = savedLanguage === 'en' ? 'en' : 'ru';
  let authReadyResolved = false;
  let resolveAuthReady;

  window.CLIENT_SPACE_AUTH_READY = new Promise((resolve) => {
    resolveAuthReady = resolve;
  });

  const dom = {
    body: document.body,
    gate: document.getElementById('auth-gate'),
    status: document.getElementById('auth-status'),
    telegramLogin: document.getElementById('telegram-login'),
    googleLogin: document.getElementById('google-login'),
    emailForm: document.getElementById('email-login-form'),
    emailInput: document.getElementById('email-login'),
    previewLogin: document.getElementById('preview-login'),
    supportLink: document.getElementById('support-link'),
    accountButton: document.getElementById('account-button'),
    accountMenu: document.getElementById('account-menu'),
    accountName: document.getElementById('account-name'),
    accountProvider: document.getElementById('account-provider'),
    logoutButton: document.getElementById('logout-button'),
    languageButtons: document.querySelectorAll('[data-auth-language]'),
  };

  function applyConfiguration() {
    const brandName = String(config.brandName || 'Client Cabinet');
    const brandMark = String(config.brandMark || 'CC').slice(0, 3);
    document.querySelectorAll('[data-cabinet-brand-name]').forEach((element) => {
      element.textContent = brandName;
    });
    document.querySelectorAll('[data-cabinet-brand-mark]').forEach((element) => {
      element.textContent = brandMark;
    });

    if (config.telegramLoginUrl) {
      dom.telegramLogin.href = config.telegramLoginUrl;
      dom.telegramLogin.hidden = false;
    }
    if (config.supportUrl) {
      dom.supportLink.href = config.supportUrl;
      dom.supportLink.hidden = false;
    }
  }

  function translate(message) {
    return language === 'ru' ? (translations[message] || message) : message;
  }

  function setStatus(message, isError = false) {
    dom.status.textContent = translate(message);
    dom.status.classList.toggle('is-error', isError);
  }

  function publishAuthContext(user, clientId, isAdmin, session = null) {
    const context = {
      user,
      clientId,
      isAdmin,
      accessToken: session?.accessToken || null,
      isLocalPreview: !session,
    };
    window.CLIENT_SPACE_AUTH_CONTEXT = context;
    if (!authReadyResolved) {
      authReadyResolved = true;
      resolveAuthReady(context);
    }
  }

  function readSession() {
    try {
      const stored = localStorage.getItem(SESSION_KEY) || localStorage.getItem(LEGACY_SESSION_KEY);
      return JSON.parse(stored);
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
    localStorage.removeItem(LEGACY_SESSION_KEY);
    return session;
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(LEGACY_SESSION_KEY);
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

  async function getAuthSettings() {
    if (!hasAuthConfig) return null;
    const response = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Could not read authentication settings.');
    return response.json();
  }

  function configureProviders(settings) {
    const external = settings?.external || {};
    dom.googleLogin.hidden = !external.google;
    dom.emailForm.hidden = !external.email;
  }

  function displayName(user) {
    const metadata = user.user_metadata || {};
    return metadata.full_name || metadata.name || metadata.username || user.email?.split('@')[0] || 'Client';
  }

  function providerName(user) {
    if (user.app_metadata?.auth_source === 'telegram') return translate('Telegram access');
    const provider = user.app_metadata?.provider;
    return provider ? `${provider[0].toUpperCase()}${provider.slice(1)} ${translate('access')}` : translate('Secure access');
  }

  function isAdminUser(user) {
    return user.app_metadata?.role === 'admin';
  }

  function showCabinet(user, session = null) {
    const name = displayName(user);
    const isAdmin = isAdminUser(user);
    const assignedClientId = String(user.app_metadata?.client_id || 'starter').trim().toLowerCase();
    const clientId = assignedClientId || 'starter';
    dom.body.classList.remove('auth-loading');
    dom.body.classList.add('is-authenticated');
    dom.gate.setAttribute('aria-hidden', 'true');
    dom.accountName.textContent = name;
    dom.accountProvider.textContent = providerName(user);
    dom.accountButton.textContent = name.trim().charAt(0).toUpperCase() || 'C';
    dom.accountButton.title = name;
    publishAuthContext(user, clientId, isAdmin, session);
  }

  function showLogin(message = 'Choose a secure sign-in method.') {
    dom.body.classList.remove('auth-loading', 'is-authenticated');
    dom.gate.removeAttribute('aria-hidden');
    setStatus(message);
  }

  async function initializeAuth() {
    const localPreviewClient = new URLSearchParams(window.location.search).get('preview');
    const localAdminPreview = ['admin', 'admin-email', 'admin-telegram'].includes(localPreviewClient);
    const isLocalPreview = ['localhost', '127.0.0.1'].includes(window.location.hostname)
      && (['starter', 'prohor'].includes(localPreviewClient) || localAdminPreview);

    if (isLocalPreview) {
      showCabinet({
        id: `local-${localPreviewClient}`,
        email: ['admin', 'admin-email'].includes(localPreviewClient) ? 'andrijpycha@gmail.com' : '',
        email_confirmed_at: ['admin', 'admin-email'].includes(localPreviewClient) ? new Date().toISOString() : null,
        user_metadata: { full_name: localPreviewClient === 'prohor' ? 'Prohor' : localAdminPreview ? 'Andrij' : 'New Client' },
        app_metadata: {
          provider: 'prototype',
          client_id: localAdminPreview ? 'starter' : localPreviewClient,
          role: localAdminPreview ? 'admin' : 'client',
        },
      });
      return;
    }

    if (!hasAuthConfig) {
      dom.previewLogin.hidden = false;
      showLogin('Secure login is being activated. You can continue to the prototype for now.');
      return;
    }

    try {
      configureProviders(await getAuthSettings());
    } catch (error) {
      console.warn('Cabinet provider settings could not be checked.', error);
      dom.emailForm.hidden = false;
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
        showCabinet(user, session);
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

  dom.emailForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!hasAuthConfig) {
      setStatus('Email login needs the final secure project setting.', true);
      return;
    }

    const email = String(new FormData(dom.emailForm).get('email') || '').trim().toLowerCase();
    if (!email) return;
    const redirectTo = `${window.location.origin}${window.location.pathname}`;
    setStatus('Sending your secure sign-in link…');
    dom.emailInput.disabled = true;

    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/otp?redirect_to=${encodeURIComponent(redirectTo)}`, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ email, create_user: false }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.msg || payload.message || 'The sign-in link could not be sent.');
      }
      dom.emailForm.reset();
      setStatus('Check your email for a secure sign-in link.');
    } catch (error) {
      setStatus(error.message || 'The sign-in link could not be sent.', true);
    } finally {
      dom.emailInput.disabled = false;
    }
  });

  dom.telegramLogin.addEventListener('click', (event) => {
    if (hasAuthConfig) return;
    event.preventDefault();
    setStatus('Telegram login needs the final secure project setting.', true);
  });

  dom.previewLogin.addEventListener('click', () => {
    showCabinet({
      id: 'prototype',
      user_metadata: { full_name: 'Prototype client' },
      app_metadata: { provider: 'prototype', client_id: 'starter' },
    });
  });

  dom.languageButtons.forEach((button) => {
    const isActive = button.dataset.authLanguage === language;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
    button.addEventListener('click', () => {
      localStorage.setItem(LANGUAGE_KEY, button.dataset.authLanguage);
      localStorage.removeItem(LEGACY_LANGUAGE_KEY);
      window.location.reload();
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

  applyConfiguration();
  initializeAuth();
})();
