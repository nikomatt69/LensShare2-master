import MetaTags from '@/components/UI/MetaTags';
import Feed from '@/components/Subscriptions/Feed';
import type { NextPage } from 'next';
import React from 'react';
import { Card } from '../UI/Card';
import { APP_NAME } from '@/constants';
import NavbarDetails from '../NavbarDetails';
import * as Apollo from '@apollo/client';
import { useEffect, useState } from 'react';
import { useAppPersistStore, useAppStore } from '@/store/app';
import { useAccount, useDisconnect, useNetwork } from 'wagmi';
import {
  Profile,
  ReferenceModules,
  UserProfilesDocument,
  UserProfilesQuery,
  UserProfilesQueryVariables
} from '@/utils/lens/generatedLenster';
import { CHAIN_ID } from '@/constants';
import { Toaster } from 'react-hot-toast';
import Sidebar from '../Sidebar/Sidebar';
import BottomNav from '../Navs/BottomNav';
import Loading from '../Loading';
import Navbar from '../Navbar';
import { GridItemEight, GridItemFour, GridLayout } from '../UI/GridLayout';
import { Head } from 'next/document';
import { useTheme } from 'next-themes';
import Loader from '../UI/Loader';
import Bytes from '../Bytes';
import { useReferenceModuleStore } from '@/store/reference-module';
import { useNonceStore } from '@/store/nonce';

const FeedRender = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  console.log(mounted);

  const setProfiles = useAppStore((state) => state.setProfiles);
  const setUserSigNonce = useNonceStore((state) => state.setUserSigNonce);
  const currentProfile = useAppStore((state) => state.currentProfile);
  const setCurrentProfile = useAppStore((state) => state.setCurrentProfile);
  const profileId = useAppPersistStore((state) => state.profileId);
  const setProfileId = useAppPersistStore((state) => state.setProfileId);
  const setSelectedReferenceModule = useReferenceModuleStore(
    (state) => state.setSelectedReferenceModule
  );

  const { address, isDisconnected } = useAccount();
  const { chain } = useNetwork();
  const { disconnect } = useDisconnect();

  const resetAuthState = () => {
    setProfileId(null);
    setCurrentProfile(null);
  };

  function useUserProfilesQuery(
    baseOptions?: Apollo.QueryHookOptions<
      UserProfilesQuery,
      UserProfilesQueryVariables
    >
  ) {
    const options = { ...baseOptions };
    return Apollo.useQuery<UserProfilesQuery, UserProfilesQueryVariables>(
      UserProfilesDocument,
      options
    );
  }

  const getIsAuthTokensAvailable = () => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    return accessToken !== 'undefined' && refreshToken !== 'undefined';
  };

  const resetAuthData = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  const { loading } = useUserProfilesQuery({
    variables: { ownedBy: address },
    skip: !profileId,
    onCompleted: (data) => {
      const profiles = data?.profiles?.items
        ?.slice()
        ?.sort((a, b) => Number(a.id) - Number(b.id))
        ?.sort((a, b) =>
          a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1
        );

      if (!profiles.length) {
        return resetAuthState();
      }

      const selectedUser = profiles.find((profile) => profile.id === profileId);
      const totalFollowing = selectedUser?.stats?.totalFollowing || 0;
      setSelectedReferenceModule(
        totalFollowing > 20
          ? ReferenceModules.DegreesOfSeparationReferenceModule
          : ReferenceModules.FollowerOnlyReferenceModule
      );
      setProfiles(profiles as Profile[]);
      setCurrentProfile(selectedUser as Profile);
      setProfileId(selectedUser?.id);
      setUserSigNonce(data?.userSigNonces?.lensHubOnChainSigNonce);
    }
  });

  const validateAuthentication = () => {
    const currentProfileAddress = currentProfile?.ownedBy;
    const isSwitchedAccount =
      currentProfileAddress !== undefined && currentProfileAddress !== address;
    const isWrongNetworkChain = chain?.id !== CHAIN_ID;
    const shouldLogout =
      !getIsAuthTokensAvailable() ||
      isWrongNetworkChain ||
      isDisconnected ||
      isSwitchedAccount;

    if (shouldLogout && profileId) {
      resetAuthState();
      resetAuthData();
      disconnect?.();
    }
  };
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    validateAuthentication();
  }, [isDisconnected, address, chain, disconnect, profileId]);

  if (loading || !mounted) {
    return <Loader />;
  }

  return (
    <GridLayout className="max-w-[1200px] pt-6">
      <MetaTags />

      <GridItemEight className="space-y-5">
        <Bytes />
      </GridItemEight>
    </GridLayout>
  );
};

export default FeedRender;
