import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { getCurrentNavigationType, getInitialScrollResetState } from './App.logic.ts';
import './index.css';

const initialScrollResetState = getInitialScrollResetState(getCurrentNavigationType());

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
