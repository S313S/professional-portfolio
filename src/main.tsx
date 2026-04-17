import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import FriendBookFinaleDebugPage from './FriendBookFinaleDebugPage.tsx';
import FriendBookDiffHotspotsDebugPage from './FriendBookDiffHotspotsDebugPage.tsx';
import {
  getCurrentNavigationType,
  getDevStandaloneRoute,
  getInitialFocusTarget,
  getInitialScrollResetState,
} from './App.logic.ts';
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
      : App;

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
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootComponent />
  </StrictMode>,
);
