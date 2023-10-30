import { Tooltip } from '@/components/UI/Tooltip';
import { usePublicationStore } from '@/store/publication4';
import { VideoCameraIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import type { FC } from 'react';


const LivestreamSettings: FC = () => {
  const showLiveVideoEditor = usePublicationStore(
    (state) => state.showLiveVideoEditor
  );
  const setShowLiveVideoEditor = usePublicationStore(
    (state) => state.setShowLiveVideoEditor
  );
  const resetLiveVideoConfig = usePublicationStore(
    (state) => state.resetLiveVideoConfig
  );

  return (
    <Tooltip placement="top" content={`Go Live`}>
      <motion.button
        whileTap={{ scale: 0.9 }}
        type="button"
        onClick={() => {
          resetLiveVideoConfig();
          setShowLiveVideoEditor(!showLiveVideoEditor);
        }}
        aria-label="Go Live"
      >
        <VideoCameraIcon className="text-brand h-5 w-5" />
      </motion.button>
    </Tooltip>
  );
};

export default LivestreamSettings;