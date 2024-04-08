import { createApiClient } from './zodios/munu';
import { eraseCookie, getCookie, setCookie } from '../cookie';
import { pluginToken } from './plugins/pluginToken';
import {
  setAuthSession,
  COOKIE_TOKEN_API,
  COOKIE_EXPIRY,
} from '../repo/session';
import { resetRepositories } from '../repo';
export { schemas } from './zodios/munu';
import {
  SettingsKeys,
  setLocalConfig,
} from '@munu/ui-lib/src/hooks/localConfig';

function newApiClient() {
  if (typeof window !== 'undefined') {
    return createApiClient('/');
  }
  const env = process.env.NODE_ENV;
  let baseUrl = process.env.API_PATH;
  if (!baseUrl) {
    baseUrl = env == 'development' ? 'http://localhost:8089' : '';
  }
  return createApiClient(baseUrl);
}

const api = newApiClient();

const after: ReturnType<typeof pluginToken> = {
  name: 'after',

  request: async (_api, config) => {
    const conf = { ...config, withCredentials: true };
    return conf;
  },

  response: async (_api, _config, response) => {
    try {
      const {
        data: {
          item: { jwt, user, roles },
        },
      } = response.data;
      setCookie(
        COOKIE_TOKEN_API,
        jwt,
        new Date(new Date().getTime() + COOKIE_EXPIRY)
      );
      setAuthSession(jwt, user, roles);
    } catch (e) {
      console.warn(e);
    }
    return response;
  },
};

const afterLogout: ReturnType<typeof pluginToken> = {
  name: 'afterLogout',

  response: async (_api, _config, response) => {
    try {
      eraseCookie(COOKIE_TOKEN_API);
      setAuthSession('', undefined, []);
      setLocalConfig(SettingsKeys.cartID, undefined);
      setLocalConfig(SettingsKeys.DownloadVideoUrl, undefined);
      resetRepositories();
    } catch (e) {
      console.warn(e);
    }
    return response;
  },
};

if (typeof window !== 'undefined') {
  api.use('post', '/api/onboarding/create-account', after);
  api.use('post', '/api/auth/signin', after);
  api.use('get', '/api/auth/refresh', after);
  api.use('post', '/api/auth/signout', afterLogout);
  api.use('post', '/api/auth/one-time-login', after);
  api.use(
    pluginToken({
      getToken: async () => getCookie(COOKIE_TOKEN_API) ?? undefined,
      renewToken: async () => {
        const {
          data: {
            item: { jwt },
          },
        } = await api.get('/api/auth/refresh');
        return jwt;
      },
    })
  );
}

function initSession() {
  api.authRefresh().catch((e) => {
    console.warn(e?.message);
  });
  setInterval(() => {
    api.authRefresh().catch((e) => {
      console.warn(e?.message);
    });
  }, COOKIE_EXPIRY - 5000);
}

initSession();

export { api };
