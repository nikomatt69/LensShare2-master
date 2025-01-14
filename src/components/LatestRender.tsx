import * as Apollo from '@apollo/client';

import { FC, useEffect, useState } from 'react';
import { useAppPersistStore, useAppStore } from '@/store/app';
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
import Loading from './Loading';
import ProfileCard from './ProfilePage/ProfileCard';
import Profiles from './ProfilePage/Profiles';
import Latest from './Latest';
import Sidebar from './Sidebar/Sidebar';
import Navbar from './Navbar';
import BottomNav from './Navs/BottomNav';
import { Toaster } from 'react-hot-toast';
import NavbarDetails from './NavbarDetails';
import MetaTags from './UI/MetaTags';
import { GridItemEight, GridItemFour, GridLayout } from './UI/GridLayout';
import { Head } from 'next/document';
import { useTheme } from 'next-themes';
import Loader from './UI/Loader';
import Wrapper from './Echos/Wrapper';
import Curated from './Echos/Curated';
import Footer from './Sidebar/Footer';
import { useNonceStore } from '@/store/nonce';
import { useReferenceModuleStore } from '@/store/reference-module';
import CuratedHome from './Echos/CuratedHome';
import SuggestedAccounts from './Sidebar/SuggestedAccounts';
import Suggested from './Sidebar/SuggestedAccounts';
import { Card } from './UI/Card';
import Explore from './HomePage/Explore';
import NewPost from './Composer/Post/New';
import { Image } from '@/components/UI/Image';
import Echos from './Echos/EchosPage';
import { HomeFeedType } from '@/enums';
import Highlights from './HomePage/Highlights';
import EchosPage from '@/pages/musicfeed';
import FeedType from './FeedType';
import Search from './Search/Search';

import Spaces from './Spaces';
import { useSpacesStore } from '@/store/spaces';
import PullToRefreshExample from './HomePage/Refresh';
interface Props {
  publication: Publication;
}

const LatestRender: FC<Props> = ({ publication }) => {
  const [mounted, setMounted] = useState(false);
  const { showSpacesLobby, showSpacesWindow } = useSpacesStore();
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

  const [feedType, setFeedType] = useState<HomeFeedType>(HomeFeedType.EXPLORE);

  useEffect(() => {
    validateAuthentication();
  }, [isDisconnected, address, chain, disconnect, profileId]);

  if (loading || !mounted) {
    return <Loader />;
  }
  const { resolvedTheme } = useTheme();

  return (
    <>
      <GridLayout className="max-w-[1200px] pt-6">
        <MetaTags />

        <Wrapper children publication={publication} />
        <GridItemEight>
          <>
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
          </>
        </GridItemEight>
        <GridItemEight>
          {currentProfile ? (
            <>
              <NewPost />
              <div className="mt-3 space-y-3">
                <FeedType feedType={feedType} setFeedType={setFeedType} />
              </div>
              <PullToRefreshExample />
              {feedType === HomeFeedType.EXPLORE ? (
                <Explore />
              ) : feedType === HomeFeedType.MUSIC ? (
                <Curated />
              ) : feedType === HomeFeedType.LATEST ? (
                <Latest />
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

export default LatestRender;
