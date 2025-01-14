import type { NextPage } from 'next';
import Spaces from '@/components/Spaces';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar/Sidebar';
import Explore from '@/components/HomePage/Explore';
import BottomNav from '../Navs/BottomNav';
import { Image } from '../UI/Image';
import * as Apollo from '@apollo/client';

import { Children, FC, useEffect, useState } from 'react';
import { useAppPersistStore, useAppStore } from '@/store/app';

import ReactPullToRefresh from 'react-pull-to-refresh';
import { useAccount, useDisconnect, useNetwork } from 'wagmi';
import {
  Profile,
  Publication,
  ReferenceModules,
  UserProfilesDocument,
  UserProfilesQuery,
  UserProfilesQueryVariables
} from '@/utils/lens/generatedLenster';
import { APP_NAME, CHAIN_ID, STATIC_ASSETS_URL } from '@/constants';
import Loading from '../Loading';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';
import MetaTags from '../UI/MetaTags';
import Bytes from '../Bytes';
import DiscoverMob from '../DiscoverPage/DiscoverMob';
import BytesSection from '../Home/BytesSection';
import NewPost from '../Composer/Post/New';
import Timeline from '../Timeline';
import { GridItemEight, GridItemFour, GridLayout } from '../UI/GridLayout';
import SuggestedAccounts from '../Sidebar/SuggestedAccounts';
import Footer from '../Sidebar/Footer';
import { useSpacesStore } from '@/store/spaces';
import SpacesWindow from '../Spaces/SpacesWindow/SpacesWindow';
import EchosPage from '@/pages/musicfeed';
import Echos from '../Echos/EchosPage';
import Audio from '../Echos/Audio';
import LoginButton from '../Login/LoginButton';

import { useTheme } from 'next-themes';
import Wrapper from '../Echos/Wrapper';
import Curated from '../Echos/Curated';
import AddToHome from './AddToHome';
import { useReferenceModuleStore } from '@/store/reference-module';
import { useNonceStore } from '@/store/nonce';
import CuratedHome from '../Echos/CuratedHome';
import Space from '../Embed/Space';
import getPublicationAttribute from '@/utils/lib/getPublicationAttribute';
import { SpaceMetadata } from '@/types/misc';
import getURLs from '../Composer/getURLs';
import getSnapshotProposalId from '@/lib/getSnapshotProposalId';
import Followerings from '../Profile/Followerings';
import RelevantPeople from '../Publication/RelevantPeople';
import Suggested from '../Sidebar/SuggestedAccounts';
import { Card } from '../UI/Card';
import FeedType from './FeedType';
import { HomeFeedType } from '@/enums';
import ForYou from './ForYou';
import Highlights from './Highlights';
import Latest from '../Latest';
import { useRoom } from '@huddle01/react/hooks';
import Refresh from './Refresh';
import PullToRefreshExample from './Refresh';
interface Props {
  publication: Publication;
}

const Home2: FC<Props> = ({ publication }) => {
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

  const { showSpacesLobby, showSpacesWindow } = useSpacesStore();

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
  const [feedType, setFeedType] = useState<HomeFeedType>(
    HomeFeedType.FOLLOWING
  );

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

  useEffect(() => {
    validateAuthentication();
  }, [isDisconnected, address, chain, disconnect, profileId]);

  const { resolvedTheme } = useTheme();

  return (
    <>
      <GridLayout className="max-w-[1200px] pt-6">
        <MetaTags />

        <Wrapper children publication={publication} />
        <GridItemEight>
          <>
            <AddToHome />

            {resolvedTheme === 'dark' ? (
              <Image
                className="cursor-pointer"
                src={`${STATIC_ASSETS_URL}/images/Lenstoknewlogo3.png`}
                alt="logo"
              />
            ) : (
              <Image
                className="cursor-pointer"
                src={`${STATIC_ASSETS_URL}/images/Lenstoknewlogo.png`}
                alt="logo"
              />
            )}

            <BytesSection />
          </>
        </GridItemEight>

        <GridItemEight className="space-y-5">
          {currentProfile ? (
            <>
              <NewPost />
              <div className="space-y-3">
                <FeedType feedType={feedType} setFeedType={setFeedType} />
              </div>
              <PullToRefreshExample />
              {feedType === HomeFeedType.FOR_YOU ? (
                <ForYou />
              ) : feedType === HomeFeedType.FOLLOWING ? (
                <Timeline />
              ) : feedType === HomeFeedType.LATEST ? (
                <Latest />
              ) : feedType === HomeFeedType.EXPLORE ? (
                <Explore />
              ) : feedType === HomeFeedType.MUSIC ? (
                <Curated />
              ) : (
                <Highlights />
              )}
            </>
          ) : (
            <Latest />
          )}
        </GridItemEight>
        <GridItemFour className=" max-h-80">
          {currentProfile?.id ? (
            <>
              <Card className="hidden border-blue-700 lg:block xl:block">
                <CuratedHome />
              </Card>

              <Card className="hidden border-blue-700 lg:block xl:block">
                <Suggested />
              </Card>
              <Footer />
            </>
          ) : (
            <>
              <Footer />
            </>
          )}
        </GridItemFour>
      </GridLayout>
    </>
  );
};

export default Home2;
