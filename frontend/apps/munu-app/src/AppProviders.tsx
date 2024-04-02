import type { EmotionCache } from '@emotion/react';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { FC, PropsWithChildren } from 'react';

import { createEmotionCache } from '@/lib/emotion';
import { muiTheme } from '@/themes/mui/mui.theme';
import { notify } from '@munu/core-lib/repo/notification';
import { SolanaTimeProvider } from '@munu/core-lib/solana/utils/SolanaTimeContext';
import { UmiProvider } from '@munu/core-lib/solana/utils/UmiProvider';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

type Props = PropsWithChildren<{
  /**
   * Optional emotion/cache to use
   */
  emotionCache?: EmotionCache;
}>;

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

export const AppProviders: FC<Props> = (props) => {
  const { children, emotionCache = clientSideEmotionCache } = props;

  let network = WalletAdapterNetwork.Devnet;
  if (
    process.env.NEXT_PUBLIC_ENVIRONMENT === 'mainnet-beta' ||
    process.env.NEXT_PUBLIC_ENVIRONMENT === 'mainnet'
  ) {
    network = WalletAdapterNetwork.Mainnet;
  }
  let endpoint = 'https://api.devnet.solana.com';
  if (process.env.NEXT_PUBLIC_RPC) {
    endpoint = process.env.NEXT_PUBLIC_RPC;
  }

  return (
    <CacheProvider value={emotionCache}>
      <MuiThemeProvider theme={muiTheme}>
        {/* Mui CssBaseline disabled in this example as tailwind provides its own */}
        {/* <CssBaseline /> */}
        <WalletProvider
          wallets={[]}
          autoConnect
          onError={(e) => {
            notify({
              message: e?.name ?? '',
              type: 'error',
              temporary: true,
            });
          }}
        >
          <UmiProvider endpoint={endpoint}>
            <WalletModalProvider>
              <SolanaTimeProvider>
                <QueryClientProvider client={queryClient}>
                  {children}
                </QueryClientProvider>
              </SolanaTimeProvider>
            </WalletModalProvider>
          </UmiProvider>
        </WalletProvider>
      </MuiThemeProvider>
    </CacheProvider>
  );
};
