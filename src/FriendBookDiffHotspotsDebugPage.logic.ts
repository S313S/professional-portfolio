export interface HotspotFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type HotspotPositioningMap = Record<string, Record<string, HotspotFrame>>;

const HOTSPOT_MIN_SIZE = 2;

function roundHotspotValue(value: number): number {
  return Math.round(value * 100) / 100;
}

export function clampHotspotFrame(frame: HotspotFrame): HotspotFrame {
  const width = Math.min(Math.max(frame.width, HOTSPOT_MIN_SIZE), 100);
  const height = Math.min(Math.max(frame.height, HOTSPOT_MIN_SIZE), 100);
  const x = Math.min(Math.max(frame.x, 0), 100 - width);
  const y = Math.min(Math.max(frame.y, 0), 100 - height);

  return {
    x: roundHotspotValue(x),
    y: roundHotspotValue(y),
    width: roundHotspotValue(width),
    height: roundHotspotValue(height),
  };
}

export function applyHotspotFrameDelta(
  frame: HotspotFrame,
  delta: { deltaX: number; deltaY: number },
  mode: 'move' | 'resize',
): HotspotFrame {
  if (mode === 'move') {
    return clampHotspotFrame({
      ...frame,
      x: frame.x + delta.deltaX,
      y: frame.y + delta.deltaY,
    });
  }

  return clampHotspotFrame({
    ...frame,
    width: frame.width + delta.deltaX,
    height: frame.height + delta.deltaY,
  });
}

export function createHotspotPositioningCodeBlock(positioning: HotspotPositioningMap): string {
  const sceneLines = Object.keys(positioning)
    .sort()
    .map((sceneId) => {
      const targetLines = Object.keys(positioning[sceneId] ?? {})
        .sort()
        .map((targetId) => {
          const frame = positioning[sceneId]![targetId]!;
          return `    '${targetId}': { x: ${frame.x}, y: ${frame.y}, width: ${frame.width}, height: ${frame.height} },`;
        })
        .join('\n');

      return `  '${sceneId}': {\n${targetLines}\n  },`;
    })
    .join('\n');

  return `export const FRIEND_BOOK_BETWEEN_TWO_PAGES_TARGET_POSITIONING = {\n${sceneLines}\n} as const;`;
}
