import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ProfileFeedType } from 'src/enums';
import Custom404 from 'src/pages/404';
import * as Apollo from '@apollo/client';
import { useAppPersistStore, useAppStore } from 'src/store/app';
import { useEffectOnce, useUpdateEffect } from 'usehooks-ts';
import RefreshButton from '../HomePage/Refresh';
import Cover from './Cover';
import Details from './Details';
import Feed from './Feed';
import FeedType from './FeedType';
import FollowDialog from './FollowDialog';

import isFeatureEnabled from '@/utils/functions/isFeatureEnabled';
import { FeatureFlag } from '@/utils/data/feature-flags';
import formatHandle from '@/utils/functions/formatHandle';
import {
  Profile,
  ProfileDocument,
  Publication,
  useProfileQuery
} from '@/utils/lens/generatedLenster';
import { GridItemEight, GridItemFour, GridLayout } from '../UI/GridLayout';
import NewPost from '../Composer/Post/New';
import { APP_NAME, CHAIN_ID, STATIC_IMAGES_URL } from '@/constants';
import MetaTags from '../UI/MetaTags';
import { Modal } from '../UI/Modal';
import { useQuery } from '@apollo/client';
import ProfileCard from '../ProfilePage/ProfileCard';
import Navbar from '../Navbar';
import BottomNav from '../Navs/BottomNav';
import Loading from '../Loading';
import SubscribersFeed from './SubscribersFeed';
import ProfileImage from '../Bytes/ProfileImage';

import Stories from '../Bytes/Stories';
import StoriesRender from '../Bytes/Stories';
import Loader from '../UI/Loader';
import Wrapper from '../Echos/Wrapper';
import { useTheme } from 'next-themes';
import {
  ReferenceModules,
  UserProfilesDocument,
  UserProfilesQuery,
  UserProfilesQueryVariables
} from '@/utils/lens/generated5';
import { useAccount, useDisconnect, useNetwork } from 'wagmi';
import { useReferenceModuleStore } from '@/store/reference-module';
import { useNonceStore } from '@/store/nonce';

const ViewProfile: NextPage = (publication) => {
  const {
    query: { id, type, followIntent }
  } = useRouter();

  const [feedType, setFeedType] = useState(
    type &&
      ['feed', 'replies', 'media', 'collects', 'nft', 'subscribers'].includes(
        type as string
      )
      ? type.toString().toUpperCase()
      : ProfileFeedType.Feed
  );

  const isNftGalleryEnabled = isFeatureEnabled(FeatureFlag.NftGallery);

  const { data, loading, error } = useQuery(ProfileDocument, {
    variables: {
      request: {
        profileId: id
      }
    }
  });

  const profile = data?.profile;
  console.log('Profile', profile);
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

  useEffect(
    () => {
      if (profile?.isFollowedByMe === true) {
        setFollowing(true);
      } else {
        setFollowing(false);
      }
      if (!currentProfile) {
        setFollowing(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profile?.isFollowedByMe]
  );

  const [following, setFollowing] = useState<boolean | null>(null);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const isFollowedByMe =
    Boolean(currentProfile) && Boolean(profile?.isFollowedByMe);

  const followType = profile?.followModule?.__typename;
  const initState = following === null;
  // profile is not defined until the second render
  if (initState && profile) {
    const canFollow =
      followType !== 'RevertFollowModuleSettings' && !isFollowedByMe;
    if (followIntent && canFollow) {
      setShowFollowModal(true);
    }
    setFollowing(isFollowedByMe);
  }

  // Profile changes when user selects a new profile from search box
  useUpdateEffect(() => {
    if (profile) {
      setFollowing(null);
    }
  }, [profile]);

  useUpdateEffect(() => {
    if (following) {
      setShowFollowModal(false);
    }
  }, [following]);

  if (error) {
    return <Custom404 />;
  }

  if (loading || !data) {
    return <Loader />;
  }

  if (!data?.profile) {
    return <Custom404 />;
  }

  return (
    <>
      <Modal show={showFollowModal} onClose={() => setShowFollowModal(false)}>
        <FollowDialog
          profile={profile as Profile}
          setFollowing={setFollowing}
          setShowFollowModal={setShowFollowModal}
        />
      </Modal>
      {profile?.name ? (
        <MetaTags
          title={`${profile?.name} (@${formatHandle(
            profile?.handle
          )}) • ${APP_NAME}`}
        />
      ) : (
        <MetaTags title={`@${formatHandle(profile?.handle)} • ${APP_NAME}`} />
      )}
      <Cover
        cover={
          profile?.coverPicture?.__typename === 'MediaSet'
            ? profile?.coverPicture?.original?.url
            : `${STATIC_IMAGES_URL}/patterns/2.svg`
        }
      />

      <GridLayout className="max-w-[1200px] pt-6">
        <GridItemFour>
          <ProfileCard
            profile={profile as Profile}
            following={Boolean(following)}
            setFollowing={setFollowing}
          />
          <StoriesRender
            profile={profile as Profile}
            trigger
            publication={publication as Publication}
          />
          <Wrapper children publication={publication as Publication} />
        </GridItemFour>
        <GridItemEight className="space-y-5">
          {currentProfile?.id ? <NewPost /> : null}
          <FeedType setFeedType={setFeedType} feedType={feedType} />
          <RefreshButton />

          {(feedType === ProfileFeedType.Feed ||
            feedType === ProfileFeedType.Replies ||
            feedType === ProfileFeedType.Media ||
            feedType === ProfileFeedType.Collects) && (
            <Feed profile={profile as Profile} type={feedType} />
          )}
          {feedType === ProfileFeedType.Subscribers && (
            <SubscribersFeed profile={profile as Profile} />
          )}
        </GridItemEight>
      </GridLayout>
    </>
  );
};

export default ViewProfile;
