import test from 'node:test';
import assert from 'node:assert/strict';

import {
  BLOCKING_HOME_LOADER_ASSETS,
  createInitialHomeLoaderAssetStatuses,
  getHomeLoaderProgress,
  hasBlockingHomeLoaderErrors,
  shouldEnableHomeLoader,
  type LoaderAsset,
} from './homeLoader';

test('enables the home loader only for the Tencent Cloud production hostnames', () => {
  assert.equal(shouldEnableHomeLoader('xiaoci-ai.com'), true);
  assert.equal(shouldEnableHomeLoader('106.54.13.225'), true);
  assert.equal(shouldEnableHomeLoader('localhost'), false);
  assert.equal(shouldEnableHomeLoader('127.0.0.1'), false);
  assert.equal(shouldEnableHomeLoader('preview.xiaoci-ai.com'), false);
});

test('blocks on direct section images, posters, and videos but not hidden interactive assets', () => {
  const assetUrls = BLOCKING_HOME_LOADER_ASSETS.map((asset) => asset.url);

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
