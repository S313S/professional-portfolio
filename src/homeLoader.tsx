import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  HOMETOWN_SERIES_1_AUDIO_SRC,
  HOMETOWN_SERIES_2_AUDIO_SRC,
} from './App.logic';
import { friendBookFinalSectionData } from './data';
import { WORKS_DETAIL_LOADING_SRC } from './components/WorksDetailSection.logic';

export type LoaderAssetKind = 'image' | 'video' | 'poster' | 'document' | 'audio';
export type LoaderAssetStatus = 'pending' | 'loaded' | 'error';

export interface LoaderAsset {
  id: string;
  url: string;
  kind: LoaderAssetKind;
  weight: number;
  blocking: boolean;
}

export interface HomeLoaderState {
  progress: number;
  isReady: boolean;
  enabled: boolean;
  assets: Record<string, LoaderAssetStatus>;
}

const HOME_LOADER_ENABLED_HOSTNAMES = new Set(['xiaoci-ai.com', '106.54.13.225']);

const createLoaderAsset = (
  id: string,
  url: string,
  kind: LoaderAssetKind,
  weight: number,
  blocking = true,
): LoaderAsset => ({
  id,
  url,
  kind,
  weight,
  blocking,
});

const dedupeLoaderAssets = (assets: LoaderAsset[]) => {
  const seenUrls = new Set<string>();

  return assets.filter((asset) => {
    if (seenUrls.has(asset.url)) {
      return false;
    }

    seenUrls.add(asset.url);
    return true;
  });
};

export const BLOCKING_HOME_LOADER_ASSETS: LoaderAsset[] = dedupeLoaderAssets([
  createLoaderAsset('experience-hero-before-image', '/images/before.png', 'image', 3),
  createLoaderAsset('experience-hero-after-image', '/images/after.png', 'image', 3),

  createLoaderAsset('video-scroll-loop-poster', '/images/video-loop-poster.png', 'poster', 2),
  createLoaderAsset('video-scroll-loop-video', '/videos/窗帘飘动.mp4', 'video', 5),
  createLoaderAsset('video-scroll-push-poster', '/images/video-transition-poster.png', 'poster', 2),
  createLoaderAsset('video-scroll-push-video', '/videos/窗帘飘动_镜头推进到相册.mp4', 'video', 5),
  createLoaderAsset('video-scroll-drag-icon', '/images/drag图标_灰色版.png', 'image', 1),
  createLoaderAsset('portfolio-audio-series-1', HOMETOWN_SERIES_1_AUDIO_SRC, 'audio', 2),
  createLoaderAsset('portfolio-audio-series-2', HOMETOWN_SERIES_2_AUDIO_SRC, 'audio', 2),

  createLoaderAsset('grow-path-background', '/images/bg_growpath.jpeg', 'image', 3),
  createLoaderAsset('grow-path-card-01', '/images/growPath_01.png', 'image', 2),
  createLoaderAsset('grow-path-card-02', '/images/growPath_02.png', 'image', 2),
  createLoaderAsset('grow-path-card-03', '/images/growPath_03.png', 'image', 2),
  createLoaderAsset('grow-path-card-04', '/images/growPath_04.png', 'image', 2),

  createLoaderAsset('career-journey-background', '/images/career_bg.png', 'image', 3),
  createLoaderAsset('career-journey-role', '/images/career_role.png', 'image', 2),
  createLoaderAsset(
    'career-journey-commerce-icon',
    '/images/career_icon_Cross-border e-commerce.png',
    'image',
    1,
  ),
  createLoaderAsset(
    'career-journey-social-media-icon',
    '/images/career_icon_socialMedia.png',
    'image',
    1,
  ),
  createLoaderAsset('career-journey-champion-card', '/images/career_icon_champion.png', 'image', 1),

  createLoaderAsset('career-detail-background', '/images/careerDetail_bg.png', 'image', 3),
  createLoaderAsset('career-detail-share-icon', '/images/careerDetail_share_icon.png', 'image', 1),
  createLoaderAsset('career-detail-work-icon', '/images/careerDetail_career_icon.png', 'image', 1),
  createLoaderAsset(
    'career-detail-industry-icon',
    '/images/careerDetail_Industry knowledge_icon.png',
    'image',
    1,
  ),
  createLoaderAsset('career-detail-scroll-selector', '/images/careerDetail_scroll_icon.png', 'image', 1),
  createLoaderAsset('career-detail-page-switch', '/images/careerDetail_pageSwitch.png', 'image', 1),
  createLoaderAsset('career-detail-aside-01', '/images/careerDetail_litteleBg_01.png', 'image', 2),
  createLoaderAsset('career-detail-aside-02', '/images/careerDetail_litteleBg_02.png', 'image', 2),
  createLoaderAsset('career-detail-aside-03', '/images/careerDetail_litteleBg_03.png', 'image', 2),

  createLoaderAsset('works-lobby-poster', '/images/WorksCollectionRoom_Bg.jpg', 'poster', 3),
  createLoaderAsset('works-lobby-video', '/videos/Lofi-girl.mp4', 'video', 5),

  createLoaderAsset('works-detail-reveal-image', '/images/workDetail_bg.jpeg', 'image', 3),
  createLoaderAsset('works-detail-left-button', '/images/workDetail_left_icon.png.png', 'image', 1),
  createLoaderAsset('works-detail-right-button', '/images/workDetail_rigtht_icon.png', 'image', 1),
  createLoaderAsset('works-detail-loading-document', WORKS_DETAIL_LOADING_SRC, 'document', 4),

  createLoaderAsset(
    'friend-book-section-background',
    friendBookFinalSectionData.assets.sectionBackground,
    'image',
    3,
  ),
  createLoaderAsset(
    'friend-book-hero-panel-background',
    friendBookFinalSectionData.assets.heroPanelBackground,
    'image',
    3,
  ),
  createLoaderAsset(
    'friend-book-archive-board-background',
    friendBookFinalSectionData.assets.archiveBoardBackground,
    'image',
    3,
  ),
  createLoaderAsset(
    'friend-book-start-playing-primary',
    friendBookFinalSectionData.assets.buttons.startPlayingPrimary,
    'image',
    1,
  ),
  createLoaderAsset(
    'friend-book-start-playing-secondary',
    friendBookFinalSectionData.assets.buttons.startPlayingSecondary,
    'image',
    1,
  ),
  createLoaderAsset(
    'friend-book-open-friend-book',
    friendBookFinalSectionData.assets.buttons.openFriendBook,
    'image',
    1,
  ),
  createLoaderAsset('friend-book-begin-button', friendBookFinalSectionData.assets.buttons.begin, 'image', 1),
  createLoaderAsset(
    'friend-book-game-card-left',
    friendBookFinalSectionData.gameCards[0]?.backgroundImage ?? '',
    'image',
    2,
  ),
  createLoaderAsset(
    'friend-book-game-card-middle',
    friendBookFinalSectionData.gameCards[1]?.backgroundImage ?? '',
    'image',
    2,
  ),
  createLoaderAsset(
    'friend-book-game-card-right',
    friendBookFinalSectionData.gameCards[2]?.backgroundImage ?? '',
    'image',
    2,
  ),
  createLoaderAsset('friend-book-avatar-capi', '/images/Avatar_caPI01.png', 'image', 1),
  createLoaderAsset('friend-book-avatar-cat', '/images/Avatar_cat01.png', 'image', 1),
  createLoaderAsset('friend-book-avatar-dog', '/images/Avatar_dog01.png', 'image', 1),
  createLoaderAsset('friend-book-avatar-rabbit', '/images/Avatar_rabit01.png', 'image', 1),
  createLoaderAsset('friend-book-avatar-tree', '/images/Avatar_tree.png', 'image', 1),
  createLoaderAsset('friend-book-preview-avatar-01', '/images/Avatar_cat01.png', 'image', 1),
  createLoaderAsset('friend-book-preview-medal-01', '/images/PurpleMedal01.png', 'image', 1),
  createLoaderAsset('friend-book-preview-avatar-02', '/images/Avatar_tree.png', 'image', 1),
  createLoaderAsset('friend-book-preview-medal-02', '/images/GreenMedal02.png', 'image', 1),
  createLoaderAsset('friend-book-preview-avatar-03', '/images/Avatar_dog01.png', 'image', 1),
  createLoaderAsset('friend-book-preview-medal-03', '/images/Animalmedals04.png', 'image', 1),
]).filter((asset) => asset.url.length > 0);

const HomeLoaderContext = createContext<HomeLoaderState | null>(null);

export function shouldEnableHomeLoader(hostname: string) {
  return HOME_LOADER_ENABLED_HOSTNAMES.has(hostname.trim().toLowerCase());
}

export function createInitialHomeLoaderAssetStatuses(assets: LoaderAsset[]) {
  return Object.fromEntries(
    assets.filter((asset) => asset.blocking).map((asset) => [asset.id, 'pending']),
  ) as Record<string, LoaderAssetStatus>;
}

export function getHomeLoaderProgress(
  assets: LoaderAsset[],
  statuses: Record<string, LoaderAssetStatus>,
) {
  const blockingAssets = assets.filter((asset) => asset.blocking);
  const totalWeight = blockingAssets.reduce((sum, asset) => sum + asset.weight, 0);

  if (totalWeight === 0) {
    return 100;
  }

  const loadedWeight = blockingAssets.reduce((sum, asset) => {
    return statuses[asset.id] === 'loaded' ? sum + asset.weight : sum;
  }, 0);

  return Math.round((loadedWeight / totalWeight) * 100);
}

export function hasBlockingHomeLoaderErrors(
  assets: LoaderAsset[],
  statuses: Record<string, LoaderAssetStatus>,
) {
  return assets
    .filter((asset) => asset.blocking)
    .some((asset) => statuses[asset.id] === 'error');
}

function areBlockingAssetsReady(assets: LoaderAsset[], statuses: Record<string, LoaderAssetStatus>) {
  return assets
    .filter((asset) => asset.blocking)
    .every((asset) => statuses[asset.id] === 'loaded');
}

function getHomeLoaderLoadedAssetCount(
  assets: LoaderAsset[],
  statuses: Record<string, LoaderAssetStatus>,
) {
  return assets
    .filter((asset) => asset.blocking)
    .reduce((count, asset) => (statuses[asset.id] === 'loaded' ? count + 1 : count), 0);
}

function preloadImageAsset(
  asset: LoaderAsset,
  updateStatus: (id: string, status: LoaderAssetStatus) => void,
) {
  const image = new Image();

  const handleLoad = () => updateStatus(asset.id, 'loaded');
  const handleError = () => updateStatus(asset.id, 'error');

  image.addEventListener('load', handleLoad);
  image.addEventListener('error', handleError);
  image.src = asset.url;

  if (image.complete && image.naturalWidth > 0) {
    updateStatus(asset.id, 'loaded');
  }

  return () => {
    image.removeEventListener('load', handleLoad);
    image.removeEventListener('error', handleError);
  };
}

function preloadVideoAsset(
  asset: LoaderAsset,
  updateStatus: (id: string, status: LoaderAssetStatus) => void,
) {
  const video = document.createElement('video');
  let hasResolved = false;

  const handleLoaded = () => {
    if (hasResolved || video.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) {
      return;
    }

    hasResolved = true;
    updateStatus(asset.id, 'loaded');
  };

  const handleError = () => {
    if (hasResolved) {
      return;
    }

    hasResolved = true;
    updateStatus(asset.id, 'error');
  };

  video.preload = 'auto';
  video.muted = true;
  video.playsInline = true;
  video.addEventListener('canplay', handleLoaded);
  video.addEventListener('loadeddata', handleLoaded);
  video.addEventListener('error', handleError);
  video.src = asset.url;
  video.load();
  handleLoaded();

  return () => {
    video.removeEventListener('canplay', handleLoaded);
    video.removeEventListener('loadeddata', handleLoaded);
    video.removeEventListener('error', handleError);
    video.pause();
    video.removeAttribute('src');
    video.load();
  };
}

function preloadDocumentAsset(
  asset: LoaderAsset,
  updateStatus: (id: string, status: LoaderAssetStatus) => void,
) {
  const iframe = document.createElement('iframe');

  const handleLoad = () => updateStatus(asset.id, 'loaded');
  const handleError = () => updateStatus(asset.id, 'error');

  iframe.setAttribute('aria-hidden', 'true');
  iframe.tabIndex = -1;
  iframe.style.position = 'absolute';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  iframe.style.border = '0';
  iframe.style.left = '-9999px';
  iframe.style.top = '-9999px';

  iframe.addEventListener('load', handleLoad);
  iframe.addEventListener('error', handleError);
  iframe.src = asset.url;
  document.body.appendChild(iframe);

  return () => {
    iframe.removeEventListener('load', handleLoad);
    iframe.removeEventListener('error', handleError);
    iframe.remove();
  };
}

function preloadAudioAsset(
  asset: LoaderAsset,
  updateStatus: (id: string, status: LoaderAssetStatus) => void,
) {
  const audio = new Audio();
  let hasResolved = false;

  const handleLoaded = () => {
    if (hasResolved || audio.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) {
      return;
    }

    hasResolved = true;
    updateStatus(asset.id, 'loaded');
  };

  const handleError = () => {
    if (hasResolved) {
      return;
    }

    hasResolved = true;
    updateStatus(asset.id, 'error');
  };

  audio.preload = 'auto';
  audio.addEventListener('canplay', handleLoaded);
  audio.addEventListener('loadeddata', handleLoaded);
  audio.addEventListener('error', handleError);
  audio.src = asset.url;
  audio.load();
  handleLoaded();

  return () => {
    audio.removeEventListener('canplay', handleLoaded);
    audio.removeEventListener('loadeddata', handleLoaded);
    audio.removeEventListener('error', handleError);
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
  };
}

function preloadHomeLoaderAsset(
  asset: LoaderAsset,
  updateStatus: (id: string, status: LoaderAssetStatus) => void,
) {
  if (asset.kind === 'document') {
    return preloadDocumentAsset(asset, updateStatus);
  }

  if (asset.kind === 'video') {
    return preloadVideoAsset(asset, updateStatus);
  }

  if (asset.kind === 'audio') {
    return preloadAudioAsset(asset, updateStatus);
  }

  return preloadImageAsset(asset, updateStatus);
}

function HomeLoaderScreen({
  progress,
  loadedCount,
  totalCount,
  hasErrors,
}: {
  progress: number;
  loadedCount: number;
  totalCount: number;
  hasErrors: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[120] overflow-hidden bg-[#FDFCF8] text-zinc-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(24,24,27,0.035),transparent_48%),linear-gradient(180deg,rgba(255,255,255,0.58),rgba(253,252,248,0.88)_26%,rgba(253,252,248,1)_100%)]" />
      <div className="absolute inset-x-0 top-[7rem] h-px bg-zinc-200/80" />
      <div className="absolute left-[-12rem] bottom-[-10rem] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(24,24,27,0.05),transparent_68%)]" />
      <div className="relative flex min-h-screen flex-col px-6 py-8 sm:px-10 sm:py-10">
        <div className="flex items-center justify-between">
          <span className="text-[1.95rem] font-black tracking-[-0.08em] text-zinc-900">Xiao Ci.</span>
          <span className="text-[0.72rem] uppercase tracking-[0.32em] text-zinc-500">
            Preparing Portfolio
          </span>
        </div>

        <div className="mx-auto flex min-h-[calc(100vh-9rem)] w-full max-w-4xl flex-1 flex-col items-center justify-center gap-10 text-center">
          <div className="space-y-5">
            <p className="text-[0.74rem] uppercase tracking-[0.34em] text-zinc-500">
              Tencent Cloud Delivery
            </p>
            <h1 className="font-serif text-[clamp(3.2rem,7.5vw,6rem)] leading-[0.9] tracking-[-0.06em] text-zinc-900">
              One moment,
              <br />
              I&apos;m setting the stage.
            </h1>
            <p className="mx-auto max-w-2xl text-sm leading-7 text-zinc-500 sm:text-base">
              The homepage is waiting for its main scenes to finish loading before it opens.
            </p>
          </div>

          <div className="w-full max-w-xl space-y-4">
            <div className="h-[2px] overflow-hidden rounded-full bg-zinc-200">
              <div
                className="h-full rounded-full bg-zinc-900 transition-[width] duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[0.72rem] uppercase tracking-[0.28em] text-zinc-500">
              <span>
                {loadedCount} / {totalCount} scenes ready
              </span>
              <span>{String(progress).padStart(2, '0')}%</span>
            </div>

            <p
              className={`text-xs leading-6 tracking-[0.18em] uppercase ${
                hasErrors ? 'text-[#8a4b33]' : 'text-zinc-400'
              }`}
            >
              {hasErrors
                ? 'Some assets failed to load. Please refresh and try again.'
                : 'The page will open as soon as the required assets are ready.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomeLoaderGate({
  enabled,
  children,
}: {
  enabled: boolean;
  children: ReactNode;
}) {
  const [assets, setAssets] = useState<Record<string, LoaderAssetStatus>>(() =>
    createInitialHomeLoaderAssetStatuses(BLOCKING_HOME_LOADER_ASSETS),
  );
  const [isReady, setIsReady] = useState(!enabled);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      setAssets(createInitialHomeLoaderAssetStatuses(BLOCKING_HOME_LOADER_ASSETS));
      setIsReady(true);
      return undefined;
    }

    setAssets(createInitialHomeLoaderAssetStatuses(BLOCKING_HOME_LOADER_ASSETS));
    setIsReady(false);

    const cleanups = BLOCKING_HOME_LOADER_ASSETS.map((asset) =>
      preloadHomeLoaderAsset(asset, (assetId, status) => {
        setAssets((currentAssets) => {
          if (currentAssets[assetId] === status) {
            return currentAssets;
          }

          return {
            ...currentAssets,
            [assetId]: status,
          };
        });
      }),
    );

    return () => {
      for (const cleanup of cleanups) {
        cleanup();
      }
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || areBlockingAssetsReady(BLOCKING_HOME_LOADER_ASSETS, assets) === false) {
      return;
    }

    setIsReady(true);
  }, [assets, enabled]);

  const blockingAssets = BLOCKING_HOME_LOADER_ASSETS.filter((asset) => asset.blocking);
  const hasErrors = hasBlockingHomeLoaderErrors(BLOCKING_HOME_LOADER_ASSETS, assets);
  const contextValue: HomeLoaderState = {
    progress: enabled ? getHomeLoaderProgress(BLOCKING_HOME_LOADER_ASSETS, assets) : 100,
    isReady,
    enabled,
    assets,
  };

  return (
    <HomeLoaderContext.Provider value={contextValue}>
      {enabled && !isReady ? (
        <HomeLoaderScreen
          progress={contextValue.progress}
          loadedCount={getHomeLoaderLoadedAssetCount(BLOCKING_HOME_LOADER_ASSETS, assets)}
          totalCount={blockingAssets.length}
          hasErrors={hasErrors}
        />
      ) : null}
      {enabled && !isReady ? null : children}
    </HomeLoaderContext.Provider>
  );
}

export function useHomeLoaderState() {
  return useContext(HomeLoaderContext);
}

export function useHomeLoaderAssetStatus(assetId: string): LoaderAssetStatus {
  const context = useHomeLoaderState();

  if (!context || context.enabled === false) {
    return 'loaded';
  }

  return context.assets[assetId] ?? 'loaded';
}
