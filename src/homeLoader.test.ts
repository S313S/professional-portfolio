import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

import { COVER_AND_SELF_INTRO_AUDIO_SRC } from './App.logic';
import { personalData } from './data';
import {
  BLOCKING_HOME_LOADER_ASSETS,
  createInitialHomeLoaderAssetStatuses,
  getHomeLoaderProgress,
  hasBlockingHomeLoaderErrors,
  shouldHoldHomeLoaderPreview,
  shouldEnableHomeLoader,
  type LoaderAsset,
} from './homeLoader';

const PUBLIC_ROOT = join(process.cwd(), 'public');
const PUBLIC_IMAGE_EXTENSIONS = /\.(?:avif|gif|jpe?g|png|svg|webp)$/i;

function listPublicImageUrls(directory: string) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      return listPublicImageUrls(entryPath);
    }

    if (!entry.isFile() || !PUBLIC_IMAGE_EXTENSIONS.test(entry.name)) {
      return [];
    }

    return [`/${relative(PUBLIC_ROOT, entryPath).split(sep).join('/')}`];
  });
}

test('enables the home loader only for the Tencent Cloud production hostnames', () => {
  assert.equal(shouldEnableHomeLoader('xiaoci-ai.com'), true);
  assert.equal(shouldEnableHomeLoader('106.54.13.225'), true);
  assert.equal(shouldEnableHomeLoader('localhost'), false);
  assert.equal(shouldEnableHomeLoader('127.0.0.1'), false);
  assert.equal(shouldEnableHomeLoader('preview.xiaoci-ai.com'), false);
});

test('allows the home loader to be previewed locally in development', () => {
  assert.equal(shouldEnableHomeLoader('localhost', '?previewHomeLoader=1', true), true);
  assert.equal(shouldEnableHomeLoader('127.0.0.1', '?previewHomeLoader=1', true), true);
  assert.equal(shouldEnableHomeLoader('localhost', '?previewHomeLoader=1', false), false);
  assert.equal(shouldEnableHomeLoader('localhost', '?foo=previewHomeLoader', true), false);
});

test('allows the local home loader preview to be held open in development', () => {
  assert.equal(shouldHoldHomeLoaderPreview('?previewHomeLoader=1&holdHomeLoader=1', true), true);
  assert.equal(shouldHoldHomeLoaderPreview('?previewHomeLoader=1&holdHomeLoader=1', false), false);
  assert.equal(shouldHoldHomeLoaderPreview('?holdHomeLoader=1', true), false);
});

test('blocks on direct section images, posters, and videos but not hidden interactive assets', () => {
  const assetUrls = BLOCKING_HOME_LOADER_ASSETS.map((asset) => asset.url);

  assert.ok(assetUrls.includes(COVER_AND_SELF_INTRO_AUDIO_SRC));
  assert.ok(assetUrls.includes('/videos/窗帘飘动.mp4'));
  assert.ok(assetUrls.includes('/images/video-transition-poster.png'));
  assert.ok(assetUrls.includes('/images/bg_growpath.jpeg'));
  assert.ok(assetUrls.includes('/detailWork-loading.html?embed=portfolio'));
  assert.ok(assetUrls.includes('/images/BookofFriends_Bg_Message Board.png'));
  assert.ok(assetUrls.includes('/images/Avatar_cat01.png'));

  assert.ok(!assetUrls.includes('/images/Animalmedals01.png'));
  assert.ok(!assetUrls.includes('/images/friend-book-quiz/Painting exam/拿破仑.jpg'));
  assert.ok(!assetUrls.includes('/videos/Lofi-girl.mov'));

  assert.equal(new Set(assetUrls).size, assetUrls.length);
});

test('blocks on every featured VisualWorks image before opening the homepage', () => {
  const assetByUrl = new Map(BLOCKING_HOME_LOADER_ASSETS.map((asset) => [asset.url, asset]));
  const featuredVisualWorkUrls = personalData.featuredWorks.map((work) => work.image);

  assert.ok(featuredVisualWorkUrls.length > 0);
  assert.ok(
    featuredVisualWorkUrls.every((url) => url.startsWith('/images/VisualWorks/')),
  );

  for (const url of featuredVisualWorkUrls) {
    assert.equal(assetByUrl.get(url)?.kind, 'image');
    assert.equal(assetByUrl.get(url)?.blocking, true);
  }
});

test('blocks on every CodingWorks image before opening the homepage', () => {
  const assetByUrl = new Map(BLOCKING_HOME_LOADER_ASSETS.map((asset) => [asset.url, asset]));
  const codingWorkUrls = listPublicImageUrls(join(PUBLIC_ROOT, 'images/CodingWorks'));

  assert.ok(codingWorkUrls.length > 0);
  assert.ok(codingWorkUrls.every((url) => url.startsWith('/images/CodingWorks/')));

  for (const url of codingWorkUrls) {
    assert.equal(statSync(join(PUBLIC_ROOT, url.slice(1))).isFile(), true);
    assert.equal(assetByUrl.get(url)?.kind, 'image');
    assert.equal(assetByUrl.get(url)?.blocking, true);
  }
});

test('does not block homepage opening on final friend-book preview medals', () => {
  const previewMedalAssets = BLOCKING_HOME_LOADER_ASSETS.filter((asset) =>
    asset.id.startsWith('friend-book-preview-medal-'),
  );

  assert.deepEqual(
    previewMedalAssets.map((asset) => asset.url),
    ['/images/PurpleMedal01.png', '/images/GreenMedal02.png', '/images/Animalmedals04.png'],
  );
  assert.ok(previewMedalAssets.every((asset) => asset.blocking === false));
});

test('preloads the cover and self-introduction audio before opening the homepage', () => {
  const coverAudioAsset = BLOCKING_HOME_LOADER_ASSETS.find(
    (asset) => asset.url === COVER_AND_SELF_INTRO_AUDIO_SRC,
  );

  assert.deepEqual(coverAudioAsset, {
    id: 'portfolio-cover-self-introduction-audio',
    url: COVER_AND_SELF_INTRO_AUDIO_SRC,
    kind: 'audio',
    weight: 2,
    blocking: true,
  });
});

test('computes weighted progress from the current blocking asset states', () => {
  const assets: LoaderAsset[] = [
    { id: 'hero-image', url: '/images/bg_growpath.jpeg', kind: 'image', weight: 1, blocking: true },
    { id: 'transition-video', url: '/videos/窗帘飘动.mp4', kind: 'video', weight: 5, blocking: true },
    { id: 'poster', url: '/images/video-transition-poster.png', kind: 'poster', weight: 2, blocking: true },
  ];
  const statuses = createInitialHomeLoaderAssetStatuses(assets);

  statuses['hero-image'] = 'loaded';
  statuses['transition-video'] = 'loaded';

  assert.equal(getHomeLoaderProgress(assets, statuses), 75);
});

test('reports blocking asset failures without converting pending assets into a ready state', () => {
  const assets: LoaderAsset[] = [
    { id: 'ready', url: '/images/bg_growpath.jpeg', kind: 'image', weight: 1, blocking: true },
    { id: 'slow-video', url: '/videos/窗帘飘动.mp4', kind: 'video', weight: 5, blocking: true },
    { id: 'failed-poster', url: '/images/video-transition-poster.png', kind: 'poster', weight: 2, blocking: true },
  ];
  const statuses = createInitialHomeLoaderAssetStatuses(assets);

  statuses.ready = 'loaded';
  statuses['failed-poster'] = 'error';

  assert.equal(hasBlockingHomeLoaderErrors(assets, statuses), true);
  assert.equal(statuses.ready, 'loaded');
  assert.equal(statuses['failed-poster'], 'error');
  assert.equal(statuses['slow-video'], 'pending');
});
