import { FC, useState, useEffect } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import {
  AuthenticateDocument,
  GetChallengeDocument,
  ProfilesDocument
} from '@/types/lens';
import { CHAIN_ID } from 'src/constants';
import { useAppPersistStore, useAppStore } from 'src/store/app';
import {
  useAccount,
  useNetwork,
  useConnect,
  useSignMessage,
  useSwitchNetwork,
  useChainId
} from 'wagmi';
import type { Connector } from 'wagmi';
import toast from 'react-hot-toast';
import SwitchNetwork from '../Composer/OpenActions/Nft/ZoraNft/Mint/SwitchNetwork';
import { useAuthenticateMutation, useChallengeLazyQuery, useUserProfilesLazyQuery } from '@/utils/lens/generated5';
import onError from '@/lib/onError';
import { Localstorage } from '@/storage';

const LoginWalletMobile: FC = () => {
  const setProfiles = useAppStore((state) => state.setProfiles);
  const setCurrentProfile = useAppStore((state) => state.setCurrentProfile);
  const setProfileId = useAppPersistStore((state) => state.setProfileId);
  const [mounted, setMounted] = useState(false);

  const chain = useChainId();
  const { switchNetwork } = useSwitchNetwork();
  const [hasConnected, setHasConnected] = useState(false);
  const { address, connector: activeConnector } = useAccount();
  const { signMessageAsync } = useSignMessage({ onError });
  const [loadChallenge, { error: errorChallenge }] = useChallengeLazyQuery({
    fetchPolicy: 'no-cache'
  });
  const [authenticate, { error: errorAuthenticate }] =
    useAuthenticateMutation();
  const [getProfiles, { error: errorProfiles }] = useUserProfilesLazyQuery();


  useEffect(() => {
    setMounted(true);
  }, []);

  const onConnect = async (connector: Connector) => {
    try {
      const account = await connectAsync({ connector });
      if (account) {
        setHasConnected(true);
        console.log('Account', account);
      }
    } catch {}
  };

  const {
    connectors,
    error,
    connectAsync,
    isLoading: isConnectLoading,
    pendingConnector
  } = useConnect({ chainId: CHAIN_ID });

  const handleLogin = async () => {
    try {
      // Get challenge
      const challenge = await loadChallenge({
        variables: {
          request: { address }
        }
      });

      if (!challenge?.data?.challenge?.text) {
        return toast.error('ERROR_MESSAGE');
      }

      // Get signature
      const signature = await signMessageAsync({
        message: challenge?.data?.challenge?.text
      });

      // Auth user and set cookies
      const auth = await authenticate({
        variables: { request: { address, signature } }
      });
      const accessToken = auth.data?.authenticate.accessToken;
      const refreshToken = auth.data?.authenticate.refreshToken;
      localStorage.setItem(Localstorage.AccessToken, accessToken);
      localStorage.setItem(Localstorage.RefreshToken, refreshToken);
      // Get authed profiles
      const { data: profilesData } = await getProfiles({
        variables: { request: { ownedBy: [address] } }
      });

      if (profilesData?.profiles?.items?.length === 0) {
        return toast.error('You have no lens profile yet, please create one');
      } else {
        const profiles: any = profilesData?.profiles?.items
          ?.slice()
          ?.sort((a, b) => Number(a.id) - Number(b.id))
          ?.sort((a, b) =>
            a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1
          );
        const currentProfile = profiles[0];
        setProfiles(profiles);
        setCurrentProfile(currentProfile);
        setProfileId(currentProfile.id);
      }
    } catch {}
  };

  return activeConnector?.id ? (
    <div>
      {chain === CHAIN_ID ? (
        <button className="flex-1 text-blue-700" onClick={() => handleLogin()}>
          {mounted ? 'Log In' : ''}
        </button>
      ) : (
        <SwitchNetwork
          className="mt-5 w-full justify-center"
          toChainId={CHAIN_ID}
        />
      )}
    </div>
  ) : (
    <button
      onClick={() => {
        {
          toast.error('Log in to view profile', { duration: 1000 });
        }
      }}
      className="border-gray-800 text-blue-700 hover:text-gray-600 focus:text-black focus:outline-none dark:text-white"
    >
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        ></path>
      </svg>
    </button>
  );
};

export default LoginWalletMobile;
