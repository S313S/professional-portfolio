import type { CSSProperties } from 'react';

import type { FriendBookMoonRunLevel } from '../data';
import type {
  FriendBookMoonRunInputState,
  FriendBookMoonRunSessionState,
} from './FriendBookFinalSection.logic';

interface FriendBookMoonRunStageProps {
  level: FriendBookMoonRunLevel;
  session: FriendBookMoonRunSessionState;
  onJump?: () => void;
  onMoveChange?: (
    direction: Extract<keyof FriendBookMoonRunInputState, 'moveLeft' | 'moveRight'>,
    isPressed: boolean,
  ) => void;
  onReplay?: () => void;
}

function getPaperFillStyle(opacity = 1): CSSProperties {
  return {
    background:
      `linear-gradient(180deg, rgba(255,247,237,${0.96 * opacity}), rgba(245,232,210,${0.92 * opacity}))`,
  };
}

function getContainedSpriteStyle(width: number, height: number): CSSProperties {
  return {
    width,
    height,
    objectFit: 'contain',
    objectPosition: 'center',
  };
}

function getGroundSegments(level: FriendBookMoonRunLevel) {
  const pits = [...level.pitZones].sort((left, right) => left.startX - right.startX);
  const segments: Array<{ x: number; width: number }> = [];
  let cursor = 0;

  for (const pit of pits) {
    if (pit.startX > cursor) {
      segments.push({ x: cursor, width: pit.startX - cursor });
    }
    cursor = pit.startX + pit.width;
  }

  if (cursor < level.worldWidth) {
    segments.push({ x: cursor, width: level.worldWidth - cursor });
  }

  return segments;
}

function getMoonRunStatusCopy(session: FriendBookMoonRunSessionState) {
  if (session.status === 'success') {
    return 'The moon gate is open. Leave a short line before the page settles.';
  }

  if (session.status === 'failed') {
    return 'The page slipped away this time. Replay the run and try a calmer route.';
  }

  if (session.damageRecoveryMs > 0) {
    return 'A brush with danger cost one heart. Take a breath and keep moving.';
  }

  return 'Run across the quiet pages, keep your hearts, and reach the moon gate.';
}

export default function FriendBookMoonRunStage({
  level,
  session,
  onJump,
  onMoveChange,
  onReplay,
}: FriendBookMoonRunStageProps) {
  const groundSegments = getGroundSegments(level);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="rounded-[1.6rem] border border-[#c9b198] bg-[rgba(255,250,245,0.76)] p-4">
        <div
          data-moon-run-viewport="true"
          className="relative overflow-hidden rounded-[1.35rem] border border-[#d8c2ab] bg-[linear-gradient(180deg,rgba(255,247,237,0.95),rgba(244,232,211,0.84)_54%,rgba(212,193,165,0.92)_100%)]"
          style={{ height: 322 }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,248,232,0.92),transparent_28%),radial-gradient(circle_at_16%_18%,rgba(255,252,245,0.9),transparent_22%)]" />

          <div
            className="absolute inset-y-0 left-0"
            style={{
              width: level.worldWidth,
              transform: `translateX(${-session.cameraX}px)`,
            }}
          >
            {level.decorations.map((decoration) => (
              <div
                key={decoration.id}
                aria-hidden="true"
                className={`absolute ${
                  decoration.kind === 'moon'
                    ? 'rounded-full border border-[rgba(125,103,76,0.22)] bg-[radial-gradient(circle_at_30%_30%,rgba(255,252,246,0.98),rgba(241,226,199,0.92)_52%,rgba(219,199,166,0.96))] shadow-[0_14px_22px_rgba(116,88,59,0.18)]'
                    : decoration.kind === 'paper'
                      ? 'rounded-full border border-[rgba(152,121,97,0.24)] bg-[rgba(255,247,234,0.68)]'
                      : 'rotate-[12deg] rounded-full border border-[rgba(156,127,105,0.18)] bg-[rgba(255,250,243,0.88)]'
                }`}
                style={{
                  left: decoration.x,
                  top: decoration.y,
                  width: decoration.width,
                  height: decoration.height,
                  opacity: decoration.opacity ?? 1,
                }}
              />
            ))}

            {groundSegments.map((segment) => (
              <div
                key={`ground-${segment.x}`}
                aria-hidden="true"
                className="absolute overflow-hidden rounded-[1.4rem] border border-[rgba(124,96,72,0.18)] shadow-[0_12px_18px_rgba(89,60,40,0.16)]"
                style={{
                  left: segment.x,
                  top: level.groundY,
                  width: segment.width,
                  height: level.worldHeight - level.groundY,
                }}
              />
            ))}

            {level.pitZones.map((pit) => (
              <div
                key={`pit-${pit.startX}`}
                aria-hidden="true"
                className="absolute rounded-t-[1rem] bg-[linear-gradient(180deg,rgba(81,56,43,0.16),rgba(46,28,22,0.58))]"
                style={{
                  left: pit.startX,
                  top: level.groundY + 8,
                  width: pit.width,
                  height: level.worldHeight - level.groundY,
                }}
              />
            ))}

            {level.platforms.map((platform) => (
              <div
                key={platform.id}
                aria-hidden="true"
                className="absolute overflow-hidden rounded-full shadow-[0_10px_14px_rgba(95,70,51,0.14)]"
                style={{
                  left: platform.x,
                  top: platform.y,
                  width: platform.width,
                  height: platform.height,
                }}
              >
                <img
                  src={level.artwork.platform}
                  alt=""
                  aria-hidden="true"
                  className="block h-full w-full"
                />
              </div>
            ))}

            <div
              data-moon-run-finish="true"
              className="absolute"
              style={{
                left: level.finish.x,
                top: level.finish.y,
                width: level.finish.width,
                height: level.finish.height,
              }}
            >
              <img
                src={level.artwork.finish}
                alt=""
                aria-hidden="true"
                className="block h-full w-full"
              />
            </div>

            {session.enemies
              .filter((enemy) => !enemy.defeated)
              .map((enemy) => (
                <div
                  key={enemy.id}
                  aria-hidden="true"
                  className="absolute"
                  style={{
                    left: enemy.x,
                    top: enemy.y,
                    width: enemy.width,
                    height: enemy.height,
                    transform: enemy.direction === 'left' ? 'scaleX(-1)' : undefined,
                  }}
                >
                  <img
                    src={level.artwork.enemy}
                    alt=""
                    aria-hidden="true"
                    style={getContainedSpriteStyle(enemy.width, enemy.height)}
                  />
                </div>
              ))}

            <div
              data-moon-run-player="true"
              className="absolute"
              style={{
                left: session.player.x,
                top: session.player.y,
                width: session.player.width,
                height: session.player.height,
                opacity: session.damageRecoveryMs > 0 ? 0.72 : 1,
                transform: session.player.facing === 'left' ? 'scaleX(-1)' : undefined,
              }}
            >
              <img
                src={level.artwork.player}
                alt=""
                aria-hidden="true"
                style={getContainedSpriteStyle(session.player.width, session.player.height)}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-3 lg:hidden">
          <button
            type="button"
            onPointerDown={() => onMoveChange?.('moveLeft', true)}
            onPointerUp={() => onMoveChange?.('moveLeft', false)}
            onPointerLeave={() => onMoveChange?.('moveLeft', false)}
            className="inline-flex min-w-[92px] items-center justify-center rounded-full border border-[#8f715c] bg-[rgba(255,248,240,0.82)] px-4 py-3 text-sm text-[#4b392f]"
          >
            Move left
          </button>
          <button
            type="button"
            onPointerDown={() => onMoveChange?.('moveRight', true)}
            onPointerUp={() => onMoveChange?.('moveRight', false)}
            onPointerLeave={() => onMoveChange?.('moveRight', false)}
            className="inline-flex min-w-[92px] items-center justify-center rounded-full border border-[#8f715c] bg-[rgba(255,248,240,0.82)] px-4 py-3 text-sm text-[#4b392f]"
          >
            Move right
          </button>
          <button
            type="button"
            onClick={onJump}
            className="inline-flex min-w-[92px] items-center justify-center rounded-full border border-[#7d604c] bg-[#6a4f3c] px-4 py-3 text-sm font-medium text-[#fff8f2]"
          >
            Jump
          </button>
        </div>
      </div>

      <aside className="rounded-[1.5rem] border border-[#dcc9b1] bg-[rgba(255,249,242,0.84)] p-5">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[#7a5d4d]">
          Moon run
        </p>
        <div className="mt-4 flex gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <span
              key={`heart-${index}`}
              data-moon-run-heart={index < session.heartsRemaining ? 'filled' : 'empty'}
              className={`inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full border px-3 text-sm ${
                index < session.heartsRemaining
                  ? 'border-[#9a6847] bg-[rgba(246,227,207,0.95)] text-[#744f37]'
                  : 'border-[#d9c8b3] bg-[rgba(255,250,245,0.82)] text-[#b39b89]'
              }`}
              style={getPaperFillStyle(index < session.heartsRemaining ? 1 : 0.55)}
            >
              <img
                src={level.artwork.heart}
                alt=""
                aria-hidden="true"
                className="h-4 w-4 object-contain"
                style={{ opacity: index < session.heartsRemaining ? 1 : 0.35 }}
              />
              Heart {index + 1}
            </span>
          ))}
        </div>
        <p className="mt-4 text-sm leading-7 text-[#503e35]">{getMoonRunStatusCopy(session)}</p>

        <div className="mt-5 rounded-[1.2rem] border border-[#dcc9b1] bg-[rgba(255,250,245,0.9)] p-4 text-sm leading-7 text-[#4b392f]">
          <p>Arrow Keys or A/D to move</p>
          <p>Space, W, or ↑ to jump</p>
        </div>

        {onReplay ? (
          <button
            type="button"
            onClick={onReplay}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#8f715c] bg-[rgba(255,248,240,0.82)] px-4 py-2 text-sm text-[#4b392f]"
          >
            Replay run
          </button>
        ) : null}
      </aside>
    </div>
  );
}
