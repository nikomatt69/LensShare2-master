import Link from 'next/link';
import { Image } from '../UI/Image';
import { useAppStore } from 'src/store/app';
import { toast } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import ButtonTest from '../Login/ButtonTest';
import LoginWalletMobile from '../Login/LoginWalletMobile';
import {
  ChatBubbleLeftIcon,
  VideoCameraIcon,
  ChatBubbleOvalLeftIcon,
  FilmIcon,
  BellIcon,
  MusicalNoteIcon
} from '@heroicons/react/24/outline';
import router from 'next/router';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { MdVideoLibrary } from 'react-icons/md';
import MessageIcon from '../Messages/MessageIcon';
import ExploreOutline from '../UI/Icons/ExploreOutline';
import VideoOutline from '../UI/Icons/VideoOutline';
import sanitizeIpfsUrl from '@/utils/sanitizeIpfsUrl';

const BottomNav: React.FC = () => {
  const currentProfile = useAppStore((state) => state.currentProfile);
  const [homePage, setHomePage] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);

  const profilePic = currentProfile?.picture;
  console.log('CURRENT PROFILE', currentProfile?.picture);

  return (
    <div>
      <nav className="z-99 fixed  bottom-0 left-0 right-0 z-[5] m-auto flex h-[56px] items-center justify-around overflow-hidden   rounded-md border-2 border-b-0 border-t border-blue-700 bg-white/70 px-4 py-3 dark:bg-gray-800/70 lg:w-[1100px] xl:w-[1200px]">
        {/* //swap timelines */}
        {homePage ? (
          <Link href="/">
            <button
              onClick={() => {
                {
                  setHomePage(false);
                }
              }}
              className="border-gray-800 text-blue-700 hover:text-gray-100 focus:text-gray-100 focus:outline-none"
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
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                ></path>
              </svg>
            </button>
          </Link>
        ) : (
          <Link href="/">
            <button
              onClick={() => {
                {
                  setHomePage(true);
                }
              }}
              className="border-gray-800 text-blue-700 hover:text-gray-100 focus:text-gray-100 focus:outline-none"
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
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                ></path>
              </svg>
            </button>
          </Link>
        )}
        <div>
          {/* //feed */}
          <Link href="/feed">
            <VideoOutline className="h-6 w-6 pb-1 text-blue-700" />{' '}
          </Link>
        </div>
        <div>
          {/* //latest */}
          <Link href="/explore">
            <FilmIcon className="h-6 w-6 pb-1 text-blue-700" />{' '}
          </Link>
        </div>

        <div>
          {/* //messages */}
          <MessageIcon />
        </div>
        {/* //log into lens & profile page */}
        {currentProfile ? (
          <Link href={`/u/${currentProfile.id}`} key={currentProfile.id}>
            {profilePic?.__typename === 'MediaSet' ? (
              profilePic.original?.url.includes('ipfs') ? (
                <Image
                  src={sanitizeIpfsUrl(profilePic?.original.url)}
                  width={30}
                  height={30}
                  className="cursor-pointer rounded-full"
                  alt={currentProfile.id.handle}
                />
              ) : (
                <Image
                  src={profilePic?.original.url}
                  width={30}
                  height={30}
                  className="cursor-pointer rounded-full"
                  alt={currentProfile.id.handle}
                />
              )
            ) : (
              <LoginWalletMobile />
            )}
          </Link>
        ) : (
          <LoginWalletMobile />
        )}
      </nav>
    </div>
  );
};

export default BottomNav;
