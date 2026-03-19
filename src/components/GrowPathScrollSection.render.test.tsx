import test from 'node:test';
import assert from 'node:assert/strict';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import * as growPathModule from './GrowPathScrollSection';
import { getGrowPathCardVisuals } from './GrowPathScrollSection.logic';

test('desktop stage renders cards as buttons once focus interactions are enabled', () => {
  assert.equal(typeof (growPathModule as Record<string, unknown>).GrowPathDesktopStage, 'function');

  const GrowPathDesktopStage = (
    growPathModule as unknown as {
      GrowPathDesktopStage: (props: Record<string, unknown>) => ReactElement;
    }
  ).GrowPathDesktopStage;

  const markup = renderToStaticMarkup(
    <GrowPathDesktopStage
      cardVisuals={getGrowPathCardVisuals(1)}
      canFocusCards
      selectedCardId={null}
      selectedCardRect={null}
      focusAnimationReady={false}
      onCardClick={() => undefined}
      onCloseFocus={() => undefined}
    />,
  );

  assert.match(markup, /aria-label="Open growth path step 01"/);
  assert.match(markup, /aria-label="Open growth path step 04"/);
  assert.match(markup, /type="button"/);
  assert.doesNotMatch(markup, /Close focused growth path card/);
});

test('desktop stage renders a soft overlay and centered focus card when a card is selected', () => {
  assert.equal(typeof (growPathModule as Record<string, unknown>).GrowPathDesktopStage, 'function');

  const GrowPathDesktopStage = (
    growPathModule as unknown as {
      GrowPathDesktopStage: (props: Record<string, unknown>) => ReactElement;
    }
  ).GrowPathDesktopStage;

  const markup = renderToStaticMarkup(
    <GrowPathDesktopStage
      cardVisuals={getGrowPathCardVisuals(1)}
      canFocusCards
      selectedCardId="growPath_02"
      selectedCardRect={{
        left: 320,
        top: 180,
        width: 390,
        height: 585,
      }}
      focusAnimationReady
      onCardClick={() => undefined}
      onCloseFocus={() => undefined}
    />,
  );

  assert.match(markup, /aria-label="Close focused growth path card"/);
  assert.match(markup, /data-focus-card="growPath_02"/);
  assert.match(markup, /aria-label="Close growth path step 02"/);
});
