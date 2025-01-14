import { ApolloProvider } from '@apollo/client';
import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';
import {
  INFURA_ID,
  INFURA_RPC,
  CHAIN_ID,
  IS_MAINNET,
  LENSTOK_URL,
  NEXT_PUBLIC_STUDIO_API_KEY,
  WALLETCONNECT_PROJECT_ID,
  APP_NAME
} from 'src/constants';
import {
  LivepeerConfig,
  createReactClient,
  studioProvider
} from '@livepeer/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { apolloClient } from '@/apollo-client';
import Video from './HomePage/Video';
import { Analytics } from '@vercel/analytics/react';

import { InjectedConnector } from 'wagmi/connectors/injected';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import getRpc from '@/lib/getRpc';

import LeafwatchProvider from './LeafwatchProvider';

import {
  EthereumClient,
  w3mConnectors,
  w3mProvider
} from '@web3modal/ethereum';
import { W3mQrCode, Web3Modal } from '@web3modal/react';
import { configureChains, Connector, createConfig, WagmiConfig } from 'wagmi';
import {
  arbitrum,
  base,
  baseGoerli,
  goerli,
  mainnet,
  optimism,
  optimismGoerli,
  polygon,
  polygonMumbai,
  zora,
  zoraTestnet
} from 'wagmi/chains';
import UserSigNoncesProvider from './UserSigNoncesProvider';
import { publicProvider } from 'wagmi/providers/public';
import FeaturedChannelsProvider from './FeaturedChannelsProvider';
import Web3Provider from './Web3Provider';
import LensSubscriptionsProvider from './LensSubscriptionsProvider';
import WebSocketProvider from './WebSocketProvider';

interface Web3ProviderProps {
  children: ReactNode;
}

const livepeerClient = createReactClient({
  provider: studioProvider({
    apiKey: process.env.NEXT_PUBLIC_STUDIO_API_KEY || '',
    baseUrl: LENSTOK_URL
  })
});

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } }
});
const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <Web3Provider>
      <ApolloProvider client={apolloClient}>
        <LensSubscriptionsProvider />
        <QueryClientProvider client={queryClient}>
          <LivepeerConfig client={livepeerClient}>
            <ThemeProvider defaultTheme="light" attribute="class">
              {children}
            </ThemeProvider>
            <Analytics />
            {/* <Video /> */}
          </LivepeerConfig>
        </QueryClientProvider>
      </ApolloProvider>
    </Web3Provider>
  );
};

export default Providers;
