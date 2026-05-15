export const getYouTubeVideoId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

export const isYouTubeUrl = (url) => {
  return /(?:youtube\.com|youtu\.be)/.test(url);
};

export const isVideoUrl = (url) => {
  return /(?:youtube\.com|youtu\.be|vimeo\.com|twitch\.tv|dailymotion\.com)/.test(url);
};

export const getYouTubeThumbnail = (videoId) => {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
};

export const extractDomain = (url) => {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return domain;
  } catch {
    return url;
  }
};

export const getFavicon = (url) => {
  try {
    const domain = new URL(url).origin;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return null;
  }
};

export const getLinkType = (url) => {
  if (!url) return 'link';
  if (isYouTubeUrl(url)) return 'youtube';
  if (isVideoUrl(url)) return 'video';
  return 'link';
};

export const formatUrl = (url) => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return 'https://' + url;
  }
  return url;
};
