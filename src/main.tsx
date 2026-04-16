import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { getCurrentNavigationType, getInitialFocusTarget, getInitialScrollResetState } from './App.logic.ts';
import './index.css';

const initialFocusTarget =
  typeof window === 'undefined' ? null : getInitialFocusTarget(window.location.search);
const initialScrollResetState = getInitialScrollResetState(
  getCurrentNavigationType(),
  initialFocusTarget,
);

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
    <App />
  </StrictMode>,
);
