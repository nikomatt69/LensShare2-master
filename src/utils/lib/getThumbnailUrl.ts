import { STATIC_IMAGES_URL } from '@/constants';
import type { MetadataOutput } from '@/utils/lens/generatedLenster';

import sanitizeIpfsUrl from '../functions/sanitizeDStorageUrl';

/**
 * Returns the thumbnail URL for the specified publication metadata.
 *
 * @param metadata The publication metadata.
 * @returns The thumbnail URL.
 */
const getThumbnailUrl = (metadata?: MetadataOutput): string => {
  const fallbackUrl = `${STATIC_IMAGES_URL}/placeholder.webp`;

  if (!metadata) {
    return fallbackUrl;
  }

  const { cover, image } = metadata;
  const url = cover?.original?.url ?? image ?? fallbackUrl;

  return sanitizeIpfsUrl(url);
};

export default getThumbnailUrl;
