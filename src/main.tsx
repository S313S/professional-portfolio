import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import CareerDetailDebugPage from './CareerDetailDebugPage.tsx';
import CodexReportPage from './CodexReportPage.tsx';
import FriendBookFinaleDebugPage from './FriendBookFinaleDebugPage.tsx';
import FriendBookDiffHotspotsDebugPage from './FriendBookDiffHotspotsDebugPage.tsx';
import WorksDetailDebugPage from './WorksDetailDebugPage.tsx';
import {
  getCurrentNavigationType,
  getDevStandaloneRoute,
  getInitialFocusTarget,
  getInitialScrollResetState,
} from './App.logic.ts';
import {
  HomeLoaderGate,
  shouldEnableHomeLoader,
  shouldHoldHomeLoaderPreview,
} from './homeLoader.tsx';
import { startPortfolioAnalytics } from './analytics.ts';
import './index.css';

const standaloneRoute =
  typeof window === 'undefined'
    ? null
    : getDevStandaloneRoute(window.location.pathname, import.meta.env.DEV);
const initialFocusTarget =
  typeof window === 'undefined' || standaloneRoute !== null
    ? null
    : getInitialFocusTarget(window.location.search);
const initialScrollResetState = getInitialScrollResetState(
  getCurrentNavigationType(),
  initialFocusTarget,
);
const RootComponent =
  standaloneRoute === 'friend-book-finale'
    ? FriendBookFinaleDebugPage
    : standaloneRoute === 'friend-book-diff-hotspots'
      ? FriendBookDiffHotspotsDebugPage
      : standaloneRoute === 'works-detail'
        ? WorksDetailDebugPage
      : standaloneRoute === 'career-detail'
        ? CareerDetailDebugPage
      : standaloneRoute === 'codex-report'
        ? CodexReportPage
      : App;
const shouldEnableRootHomeLoader =
  typeof window !== 'undefined' &&
  standaloneRoute === null &&
  RootComponent === App &&
  shouldEnableHomeLoader(window.location.hostname, window.location.search, import.meta.env.DEV);
const shouldHoldRootHomeLoader =
  typeof window !== 'undefined' &&
  shouldHoldHomeLoaderPreview(window.location.search, import.meta.env.DEV);

if (typeof window !== 'undefined') {
  window.history.scrollRestoration = initialScrollResetState.scrollRestoration;

  if (initialScrollResetState.shouldResetScrollToTop) {
    const resetScrollToTop = () => {
      window.scrollTo(0, 0);
    };

    resetScrollToTop();
    requestAnimationFrame(resetScrollToTop);
    window.addEventListener('load', resetScrollToTop, { once: true });
  }

  if (standaloneRoute === null) {
    startPortfolioAnalytics();
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {shouldEnableRootHomeLoader ? (
      <HomeLoaderGate enabled holdReady={shouldHoldRootHomeLoader}>
        <App />
      </HomeLoaderGate>
    ) : (
      <RootComponent />
    )}
  </StrictMode>,
);
