
import Video from '@/components/Composer/Video';
import { Card } from '@/components/UI/Card';
import { Spinner } from '@/components/UI/Spinner';
import { Tooltip } from '@/components/UI/Tooltip';
import { BASE_URL, IS_MAINNET, LIVE_WORKER_URL } from '@/constants';
import { Localstorage } from '@/storage';
import { usePublicationStore } from '@/store/publication4';
import {
  ClipboardDocumentIcon,
  SignalIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import { XCircleIcon } from '@heroicons/react/24/solid';



import axios from 'axios';
import { type FC, useState } from 'react';
import toast from 'react-hot-toast';
import { useAppStore } from 'src/store/app';


const LivestreamEditor: FC = () => {
  const currentProfile = useAppStore((state) => state.currentProfile);
  const setShowLiveVideoEditor = usePublicationStore(
    (state) => state.setShowLiveVideoEditor
  );
  const liveVideoConfig = usePublicationStore((state) => state.liveVideoConfig);
  const setLiveVideoConfig = usePublicationStore(
    (state) => state.setLiveVideoConfig
  );
  const resetLiveVideoConfig = usePublicationStore(
    (state) => state.resetLiveVideoConfig
  );
  const [creating, setCreating] = useState(false);

  const createLiveStream = async () => {
    try {
      setCreating(true);
      const response = await axios.post(
        `${LIVE_WORKER_URL}/create`,
        {
          
          id: currentProfile?.id,
          isMainnet: IS_MAINNET

        },
       
      );
      const { data } = response;
      setLiveVideoConfig({
        id: data.result.id,
        playbackId: data.result.playbackId,
        streamKey: data.result.streamKey
      });
    } catch {
      toast.error(`Error creating live stream`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Card className="m-5 px-5 py-3" forceRounded>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm">
          <VideoCameraIcon className="text-brand h-4 w-4" />
          <b>
            Go Live
          </b>
        </div>
        <div className="flex items-center space-x-3">
          <Tooltip placement="top" content={`Delete`}>
            <button
              className="flex"
              onClick={() => {
                resetLiveVideoConfig();
                setShowLiveVideoEditor(false);
              }}
            >
              <XCircleIcon className="h-5 w-5 text-red-400" />
            </button>
          </Tooltip>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {liveVideoConfig.playbackId  ? (
          <>
            <Card className="space-y-2 p-3">
              <div className="flex items-center space-x-1">
                <b>
                 Stream URL:
                </b>
                <div className="">rtmp://rtmp.livepeer.com/live</div>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      'rtmp://rtmp.livepeer.com/live'
                    );
                    toast.success(`Copied to clipboard!`);
                  }}
                >
                  <ClipboardDocumentIcon className="h-4 w-4 text-gray-400" />
                </button>
              </div>
              <div className="flex items-center space-x-1">
                <b>
                  Stream Key:
                </b>
                <div className="">{liveVideoConfig.streamKey}</div>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      liveVideoConfig.streamKey
                    );
                    toast.success(`Copied to clipboard!`);
                  }}
                >
                  <ClipboardDocumentIcon className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </Card>
            <Video
              src={`https://livepeercdn.studio/hls/${liveVideoConfig.playbackId}/index.m3u8`}
            />
          </>
        ) : (
          <button className="w-full" onClick={createLiveStream}>
            <Card className="flex justify-center p-3 font-bold hover:bg-gray-50 dark:hover:bg-gray-900">
              <div className="flex items-center space-x-2">
                {creating ? (
                  <>
                    <Spinner size="xs" />
                    <div>
                      Creating Live Stream...
                    </div>
                  </>
                ) : (
                  <>
                    <SignalIcon className="text-brand h-5 w-5" />
                    <div>
                     Create Live Stream
                    </div>
                  </>
                )}
              </div>
            </Card>
          </button>
        )}
      </div>
    </Card>
  );
};

export default LivestreamEditor;