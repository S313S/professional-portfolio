import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import {
  getCareerDetailDragGestureState,
  getCareerDetailSnapState,
  getCareerDetailSnapTargetY,
  getCareerDetailWheelState,
  isCareerDetailSectionPinned,
} from './CareerDetailSection.logic';

const CAREER_DETAIL_ASSETS = {
  background: '/images/careerDetail_bg.png',
  sharingJourney: '/images/careerDetail_share_icon.png',
  workExperience: '/images/careerDetail_career_icon.png',
  industryKnowledge: '/images/careerDetail_Industry knowledge_icon.png',
  scrollSelector: '/images/careerDetail_scroll_icon.png',
  map: '/images/careerDetail_map.png',
} as const;

export type CareerDetailTabKey = 'sharingJourney' | 'workExperience' | 'industryKnowledge';

interface Size {
  width: number;
  height: number;
}

interface PixelRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Point {
  x: number;
  y: number;
}

interface CareerDetailTabConnector {
  startOffset: Point;
  controlA: Point;
  controlB: Point;
  end: Point;
}

interface CareerDetailContentBlock {
  eyebrow: string;
  headline: string;
  body: string;
  supportingTitle: string;
  supportingBody: string;
  annotation: string;
}

interface CareerDetailRecord {
  id: string;
  label: string;
  locationLine: string;
  dateTitle: string;
  contentByTab: Record<CareerDetailTabKey, CareerDetailContentBlock>;
}

const CAREER_DETAIL_RECORDS: CareerDetailRecord[] = [
  {
    id: 'aurora-basin-expedition',
    label: 'Aurora Basin Expedition',
    locationLine: 'Location: Latitude 45.4215° N',
    dateTitle: 'October 14th, 1894',
    contentByTab: {
      sharingJourney: {
        eyebrow: 'Chronicle I:',
        headline: 'Chief Surveyor & Field Archivist',
        body:
          'Appointed by the Royal Geographical Society to chart the uncharted territories of the Inner Rim. Led the creation of more than forty-two high-fidelity topographical surveys using experimental lunar triangulation methods. Orchestrated the 1892 expedition through the Silent Valley, enduring three months of total isolation to capture the auroral shift.',
        supportingTitle: 'Instrument Calibration Specialist',
        supportingBody:
          "Pioneered the integration of brass analytical engines with traditional celestial sextants. Reduced celestial navigation error margins by 14.2% across the fleet. Served as the primary consultant for the HMS Discovery's deep-water Sima Trench sounding, ensuring accurate depth charting in the Marianas.",
        annotation: '[Expanded archive: HMS Discovery sounding error-correction data]',
      },
      workExperience: {
        eyebrow: 'Chronicle II: Work Experience',
        headline: 'Instrument Calibration Specialist',
        body:
          'I moved from scattered support work into more deliberate systems thinking, building repeatable workflows, tightening delivery, and learning how to make ambiguity legible for teams under pressure.',
        supportingTitle: 'Making Motion Traceable',
        supportingBody:
          'From campaign ops to AI-enabled execution, the work shifted from “finishing tasks” to building a process that other people could trust, inspect, and extend.',
        annotation: 'Field ledger updated with each operating model revision.',
      },
      industryKnowledge: {
        eyebrow: 'Chronicle III: Industry Knowledge',
        headline: 'Surveying the New Frontier',
        body:
          'As the market tilted toward AI, I stopped treating trends as headlines and began mapping them as infrastructure shifts: tooling, behavior change, distribution costs, and the hidden work needed for adoption.',
        supportingTitle: 'Reading the Weather Correctly',
        supportingBody:
          'That lens made it easier to separate durable capability from surface excitement, and to identify where product intuition still needed evidence from operators and users.',
        annotation: 'Expanded from dispatches, market scans, and operator interviews.',
      },
    },
  },
  {
    id: 'signal-house-residency',
    label: 'Signal House Residency',
    locationLine: 'Location: Latitude 31.2304° N',
    dateTitle: 'May 3rd, 1901',
    contentByTab: {
      sharingJourney: {
        eyebrow: 'Chronicle I: Sharing Journey',
        headline: 'Letters Sent Back To Shore',
        body:
          'By the second chapter, sharing was less about confession and more about pattern recognition. I began writing for people standing at the same crossroads, not just for the version of me that survived them.',
        supportingTitle: 'From Memory To Navigation',
        supportingBody:
          'The stories became more useful once they were organized around decisions, tradeoffs, and consequences instead of mood alone.',
        annotation: 'Annotated for future wayfinders moving between craft and change.',
      },
      workExperience: {
        eyebrow: 'Chronicle II: Work Experience',
        headline: 'Workroom Systems Cartographer',
        body:
          'This phase was defined by synthesis: aligning creators, operators, and AI workflows around the same execution rhythm so experiments could become a repeatable practice instead of isolated wins.',
        supportingTitle: 'Where The Friction Hid',
        supportingBody:
          'Most bottlenecks were not technical. They lived in handoffs, unclear expectations, and unspoken assumptions about quality, speed, and ownership.',
        annotation: 'Compiled after multiple cycles of process redesign.',
      },
      industryKnowledge: {
        eyebrow: 'Chronicle III: Industry Knowledge',
        headline: 'Signal Patterns Across The Trade Routes',
        body:
          'I catalogued patterns from docks, dispatches, and demand maps, then used them to understand how AI, content, and commerce were beginning to co-produce each other instead of moving as separate streams.',
        supportingTitle: 'Demand Leaves Repeating Marks',
        supportingBody:
          'The more I tracked distribution behavior, the clearer it became that good strategy depended on seeing ecosystem feedback loops early, before they hardened into consensus.',
        annotation: 'Margin note: watch the channels where product utility meets social proof.',
      },
    },
  },
  {
    id: 'northwind-relay-office',
    label: 'Northwind Relay Office',
    locationLine: 'Location: Latitude 64.1466° N',
    dateTitle: 'January 18th, 1908',
    contentByTab: {
      sharingJourney: {
        eyebrow: 'Chronicle I: Sharing Journey',
        headline: 'Dispatches Written Between Storm Fronts',
        body:
          'Sharing entered a steadier phase here. I stopped polishing every sentence for approval and started publishing notes that were timely, specific, and useful enough to travel on their own.',
        supportingTitle: 'Trust Built Through Cadence',
        supportingBody:
          'Consistency changed the relationship with the audience. Repetition made the voice clearer, and clearer structure made the ideas easier to carry into someone else’s real work.',
        annotation: 'Filed during a season of frequent public dispatches and editorial resets.',
      },
      workExperience: {
        eyebrow: 'Chronicle II: Work Experience',
        headline: 'Relay Operations Lead',
        body:
          'Work became less about isolated execution and more about orchestration: sequencing people, tools, and handoffs so momentum survived context switches instead of dying inside them.',
        supportingTitle: 'Handoffs Became The Real Product',
        supportingBody:
          'The strongest systems were not the flashiest ones. They were the ones where the next person always knew what had happened, what mattered, and what to do next.',
        annotation: 'Operational notes preserved from multi-team delivery cycles.',
      },
      industryKnowledge: {
        eyebrow: 'Chronicle III: Industry Knowledge',
        headline: 'Relay Signals Across Emerging Markets',
        body:
          'I began reading market shifts through velocity: which tools shortened cycle time, which channels amplified demand, and which signals looked loud only because measurement lagged behind behavior.',
        supportingTitle: 'Speed Changed What Counted',
        supportingBody:
          'Once AI compressed production time, strategic advantage moved upstream toward taste, distribution, and judgment under uncertainty.',
        annotation: 'Indexed from trend scans, launch monitoring, and operator debriefs.',
      },
    },
  },
  {
    id: 'glass-harbor-ledger',
    label: 'Glass Harbor Ledger',
    locationLine: 'Location: Latitude 22.3193° N',
    dateTitle: 'August 27th, 1912',
    contentByTab: {
      sharingJourney: {
        eyebrow: 'Chronicle I: Sharing Journey',
        headline: 'What Stayed After The Applause Faded',
        body:
          'By this chapter, sharing was no longer about output volume. It became an editorial filter: deciding what was durable enough to archive, what was situational, and what only mattered because I was standing too close to it.',
        supportingTitle: 'Editing For Signal, Not Noise',
        supportingBody:
          'That discipline made each piece lighter, sharper, and more transferable. Fewer stories needed to say more.',
        annotation: 'Archived after a long pass of pruning, sequencing, and reframing.',
      },
      workExperience: {
        eyebrow: 'Chronicle II: Work Experience',
        headline: 'Ledger Systems Steward',
        body:
          'I moved deeper into system stewardship: maintaining quality across repeated cycles, spotting where process debt accumulated, and refining the rules that kept execution fast without making it brittle.',
        supportingTitle: 'Maintenance Was Strategic Work',
        supportingBody:
          'The hidden value came from upkeep. Small structural corrections prevented expensive downstream confusion.',
        annotation: 'Compiled from retrospectives, maintenance logs, and QA reviews.',
      },
      industryKnowledge: {
        eyebrow: 'Chronicle III: Industry Knowledge',
        headline: 'Harbor Economics Of The AI Trade',
        body:
          'The pattern was clearer now: AI advantage rarely lived in the model alone. It emerged where workflow design, audience understanding, and operational discipline reinforced each other.',
        supportingTitle: 'Infrastructure Wins Quietly',
        supportingBody:
          'Markets often celebrate interfaces first and infrastructure later, but lasting leverage usually arrives in the opposite order.',
        annotation: 'Cross-referenced against product launches, monetization shifts, and channel behavior.',
      },
    },
  },
];

const CAREER_DETAIL_TABS: Array<{
  key: CareerDetailTabKey;
  label: string;
  imageSrc: string;
}> = [
  {
    key: 'sharingJourney',
    label: 'Sharing Journey',
    imageSrc: CAREER_DETAIL_ASSETS.sharingJourney,
  },
  {
    key: 'workExperience',
    label: 'Work Experience',
    imageSrc: CAREER_DETAIL_ASSETS.workExperience,
  },
  {
    key: 'industryKnowledge',
    label: 'Industry Knowledge',
    imageSrc: CAREER_DETAIL_ASSETS.industryKnowledge,
  },
];

const CAREER_DETAIL_BACKGROUND_SIZE: Size = {
  width: 5574,
  height: 3010,
};

const CAREER_DETAIL_DEFAULT_STAGE_SIZE: Size = {
  width: 1600,
  height: 900,
};

const CAREER_DETAIL_DRAG_SWITCH_THRESHOLD = 72;
const CAREER_DETAIL_WHEEL_SWITCH_THRESHOLD = 80;
const CAREER_DETAIL_WHEEL_SWITCH_COOLDOWN_MS = 220;

// Desktop-only manual tuning zone:
// These numbers are the original background-image pixel bounds that the three
// interactive paper buttons should cover 1:1. If you need to hand-tune the
// overlay later, edit ONLY these x/y/width/height values.
const CAREER_DETAIL_DESKTOP_TAB_PIXEL_RECTS: Record<CareerDetailTabKey, PixelRect> = {
  sharingJourney: {
    x: 288,
    y: 252,
    width: 1332,
    height: 720,
  },
  workExperience: {
    x: 300,
    y: 1040,
    width: 1320,
    height: 708,
  },
  industryKnowledge: {
    x: 252,
    y: 1800,
    width: 1380,
    height: 726,
  },
};

const CAREER_DETAIL_DESKTOP_TAB_CONNECTORS: Record<CareerDetailTabKey, CareerDetailTabConnector> = {
  sharingJourney: {
    startOffset: { x: 0.94, y: 0.42 },
    controlA: { x: 0.31, y: 0.22 },
    controlB: { x: 0.336, y: 0.3 },
    end: { x: 0.36, y: 0.325 },
  },
  workExperience: {
    startOffset: { x: 0.95, y: 0.5 },
    controlA: { x: 0.31, y: 0.415 },
    controlB: { x: 0.336, y: 0.43 },
    end: { x: 0.36, y: 0.442 },
  },
  industryKnowledge: {
    startOffset: { x: 0.94, y: 0.56 },
    controlA: { x: 0.305, y: 0.63 },
    controlB: { x: 0.334, y: 0.56 },
    end: { x: 0.36, y: 0.56 },
  },
};

const getCoveredImageFrame = (containerSize: Size, imageSize: Size) => {
  const scale = Math.max(containerSize.width / imageSize.width, containerSize.height / imageSize.height);
  const width = imageSize.width * scale;
  const height = imageSize.height * scale;

  return {
    scale,
    left: (containerSize.width - width) / 2,
    top: (containerSize.height - height) / 2,
  };
};

const getDesktopTabStyle = (tabKey: CareerDetailTabKey, stageSize: Size) => {
  const imageFrame = getCoveredImageFrame(stageSize, CAREER_DETAIL_BACKGROUND_SIZE);
  const rect = CAREER_DETAIL_DESKTOP_TAB_PIXEL_RECTS[tabKey];

  return {
    left: `${imageFrame.left + rect.x * imageFrame.scale}px`,
    top: `${imageFrame.top + rect.y * imageFrame.scale}px`,
    width: `${rect.width * imageFrame.scale}px`,
    height: `${rect.height * imageFrame.scale}px`,
  };
};

const getDesktopTabRect = (tabKey: CareerDetailTabKey, stageSize: Size): PixelRect => {
  const imageFrame = getCoveredImageFrame(stageSize, CAREER_DETAIL_BACKGROUND_SIZE);
  const rect = CAREER_DETAIL_DESKTOP_TAB_PIXEL_RECTS[tabKey];

  return {
    x: imageFrame.left + rect.x * imageFrame.scale,
    y: imageFrame.top + rect.y * imageFrame.scale,
    width: rect.width * imageFrame.scale,
    height: rect.height * imageFrame.scale,
  };
};

const getStagePoint = (stageSize: Size, point: Point): Point => ({
  x: stageSize.width * point.x,
  y: stageSize.height * point.y,
});

const getDesktopConnectorPath = (tabKey: CareerDetailTabKey, stageSize: Size) => {
  const rect = getDesktopTabRect(tabKey, stageSize);
  const connector = CAREER_DETAIL_DESKTOP_TAB_CONNECTORS[tabKey];
  const start = {
    x: rect.x + rect.width * connector.startOffset.x,
    y: rect.y + rect.height * connector.startOffset.y,
  };
  const controlA = getStagePoint(stageSize, connector.controlA);
  const controlB = getStagePoint(stageSize, connector.controlB);
  const end = getStagePoint(stageSize, connector.end);

  return `M ${start.x} ${start.y} C ${controlA.x} ${controlA.y}, ${controlB.x} ${controlB.y}, ${end.x} ${end.y}`;
};

const joinClasses = (...classNames: Array<string | false | null | undefined>) =>
  classNames.filter(Boolean).join(' ');

export default function CareerDetailSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const hasSnappedOnCurrentEntryRef = useRef(false);
  const lastScrollYRef = useRef(0);
  const selectedRecordIdRef = useRef(CAREER_DETAIL_RECORDS[0]?.id ?? '');
  const selectorDragStateRef = useRef<{
    pointerId: number | null;
    dragStartY: number | null;
    hasCommittedInGesture: boolean;
  }>({
    pointerId: null,
    dragStartY: null,
    hasCommittedInGesture: false,
  });
  const wheelDeltaAccumulatorRef = useRef(0);
  const lastWheelDirectionRef = useRef(0);
  const lastWheelSwitchAtRef = useRef(0);
  const [sectionSize, setSectionSize] = useState<Size>(CAREER_DETAIL_DEFAULT_STAGE_SIZE);
  const [selectedRecordId, setSelectedRecordId] = useState(CAREER_DETAIL_RECORDS[0]?.id ?? '');
  const [selectedTab, setSelectedTab] = useState<CareerDetailTabKey>('sharingJourney');
  const [isSelectorDragging, setIsSelectorDragging] = useState(false);

  const selectedRecord = useMemo(
    () =>
      CAREER_DETAIL_RECORDS.find((record) => record.id === selectedRecordId) ??
      CAREER_DETAIL_RECORDS[0],
    [selectedRecordId],
  );
  const selectedRecordIndex = Math.max(
    CAREER_DETAIL_RECORDS.findIndex((record) => record.id === selectedRecord.id),
    0,
  );

  const selectedContent = selectedRecord.contentByTab[selectedTab];
  const desktopTabStyles = useMemo(
    () =>
      Object.fromEntries(
        CAREER_DETAIL_TABS.map((tab) => [tab.key, getDesktopTabStyle(tab.key, sectionSize)]),
      ) as Record<CareerDetailTabKey, CSSProperties>,
    [sectionSize],
  );
  const desktopConnectorPaths = useMemo(
    () =>
      Object.fromEntries(
        CAREER_DETAIL_TABS.map((tab) => [tab.key, getDesktopConnectorPath(tab.key, sectionSize)]),
      ) as Record<CareerDetailTabKey, string>,
    [sectionSize],
  );
  const selectorThumbStyle = useMemo(() => {
    const progress =
      CAREER_DETAIL_RECORDS.length <= 1 ? 0.5 : selectedRecordIndex / (CAREER_DETAIL_RECORDS.length - 1);

    return {
      top: `${8 + progress * 84}%`,
    } satisfies CSSProperties;
  }, [selectedRecordIndex]);

  const commitSelectedRecordId = (recordId: string) => {
    selectedRecordIdRef.current = recordId;
    setSelectedRecordId(recordId);
  };

  const resetSelectorDrag = () => {
    selectorDragStateRef.current = {
      pointerId: null,
      dragStartY: null,
      hasCommittedInGesture: false,
    };
    setIsSelectorDragging(false);
  };

  const handleSelectorPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    const section = sectionRef.current;
    if (section) {
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: getCareerDetailSnapTargetY(sectionTop),
        behavior: 'auto',
      });
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    selectorDragStateRef.current = {
      pointerId: event.pointerId,
      dragStartY: event.clientY,
      hasCommittedInGesture: false,
    };
    setIsSelectorDragging(true);
  };

  const handleSelectorPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const dragState = selectorDragStateRef.current;
    if (dragState.pointerId !== event.pointerId) {
      return;
    }

    const activeIndex = CAREER_DETAIL_RECORDS.findIndex(
      (record) => record.id === selectedRecordIdRef.current,
    );
    const gestureState = getCareerDetailDragGestureState({
      dragStartY: dragState.dragStartY,
      currentY: event.clientY,
      threshold: CAREER_DETAIL_DRAG_SWITCH_THRESHOLD,
      activeIndex: activeIndex >= 0 ? activeIndex : 0,
      recordCount: CAREER_DETAIL_RECORDS.length,
      hasCommittedInGesture: dragState.hasCommittedInGesture,
    });

    if (!gestureState.shouldCommitSwitch) {
      return;
    }

    event.preventDefault();
    selectorDragStateRef.current = {
      ...dragState,
      hasCommittedInGesture: gestureState.hasCommittedInGesture,
    };

    const nextRecord = CAREER_DETAIL_RECORDS[gestureState.nextIndex];
    if (nextRecord) {
      commitSelectedRecordId(nextRecord.id);
    }
  };

  const handleSelectorPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (selectorDragStateRef.current.pointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    resetSelectorDrag();
  };

  useEffect(() => {
    selectedRecordIdRef.current = selectedRecordId;
  }, [selectedRecordId]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }

    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const sectionTop = section.getBoundingClientRect().top + scrollY;
      const sectionHeight = section.offsetHeight;
      const snapState = getCareerDetailSnapState({
        scrollY,
        lastScrollY: lastScrollYRef.current,
        sectionTop,
        sectionHeight,
        viewportHeight: window.innerHeight,
        hasSnappedOnCurrentEntry: hasSnappedOnCurrentEntryRef.current,
      });

      if (snapState.shouldResetLatch) {
        hasSnappedOnCurrentEntryRef.current = false;
      }

      if (snapState.shouldSnap) {
        hasSnappedOnCurrentEntryRef.current = true;
        window.scrollTo({
          top: getCareerDetailSnapTargetY(sectionTop),
          behavior: 'smooth',
        });
      }

      lastScrollYRef.current = scrollY;
    };

    const handleWheel = (event: WheelEvent) => {
      if (!window.matchMedia('(min-width: 1024px)').matches) {
        wheelDeltaAccumulatorRef.current = 0;
        lastWheelDirectionRef.current = 0;
        return;
      }

      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const activeIndex = CAREER_DETAIL_RECORDS.findIndex(
        (record) => record.id === selectedRecordIdRef.current,
      );
      const wheelState = getCareerDetailWheelState({
        deltaY: event.deltaY,
        activeIndex: activeIndex >= 0 ? activeIndex : 0,
        recordCount: CAREER_DETAIL_RECORDS.length,
        isSectionPinned: isCareerDetailSectionPinned(window.scrollY, sectionTop),
      });

      if (!wheelState.shouldPreventScroll) {
        wheelDeltaAccumulatorRef.current = 0;
        lastWheelDirectionRef.current = 0;
        return;
      }

      event.preventDefault();
      window.scrollTo({
        top: getCareerDetailSnapTargetY(sectionTop),
        behavior: 'auto',
      });

      const direction = Math.sign(event.deltaY);
      if (direction === 0) {
        return;
      }

      if (direction !== lastWheelDirectionRef.current) {
        wheelDeltaAccumulatorRef.current = 0;
      }

      lastWheelDirectionRef.current = direction;
      wheelDeltaAccumulatorRef.current += event.deltaY;

      const now = window.performance?.now?.() ?? Date.now();
      const hasReachedThreshold =
        Math.abs(wheelDeltaAccumulatorRef.current) >= CAREER_DETAIL_WHEEL_SWITCH_THRESHOLD;
      const isCoolingDown =
        now - lastWheelSwitchAtRef.current < CAREER_DETAIL_WHEEL_SWITCH_COOLDOWN_MS;

      if (!hasReachedThreshold || isCoolingDown) {
        return;
      }

      wheelDeltaAccumulatorRef.current = 0;
      lastWheelSwitchAtRef.current = now;

      const nextRecord = CAREER_DETAIL_RECORDS[wheelState.nextIndex];
      if (nextRecord) {
        commitSelectedRecordId(nextRecord.id);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof ResizeObserver === 'undefined') {
      return;
    }

    const updateSectionSize = () => {
      setSectionSize({
        width: section.clientWidth,
        height: section.clientHeight,
      });
    };

    updateSectionSize();

    const resizeObserver = new ResizeObserver(() => {
      updateSectionSize();
    });

    resizeObserver.observe(section);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="career-detail-section"
      aria-labelledby="career-detail-date-title"
      className="relative min-h-[100dvh] overflow-hidden bg-[#ece2d0] text-[#2b2119]"
    >
      <div className="absolute inset-0">
        <img
          src={CAREER_DETAIL_ASSETS.background}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(239,228,211,0.16)_0%,rgba(246,240,229,0.06)_42%,rgba(238,228,213,0.18)_100%)]" />
      </div>

      {/* Desktop paper-button overlay.
          This layer uses background-image pixel coordinates so the interactive
          buttons stay locked to the baked-in paper art even when object-cover
          changes the rendered image scale/crop. */}
      <div
        data-career-detail-tab-overlay="desktop"
        data-career-detail-tab-positioning="background-pixel-lock"
        className="pointer-events-none absolute inset-0 z-30 hidden lg:block"
      >
        <div
          data-career-detail-connector-layer="desktop"
          aria-hidden="true"
          className="absolute inset-0"
        >
          <svg
            data-career-detail-connector-svg="desktop"
            viewBox={`0 0 ${sectionSize.width} ${sectionSize.height}`}
            className="h-full w-full overflow-visible"
          >
            <defs>
              <marker
                id="career-detail-connector-arrow"
                data-career-detail-connector-arrowhead="desktop"
                markerWidth="8"
                markerHeight="8"
                refX="6.5"
                refY="4"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path
                  d="M 0 0 L 8 4 L 0 8 L 2.2 4 z"
                  style={{
                    fill: 'rgba(116, 92, 67, 0.9)',
                    stroke: 'rgba(92, 70, 48, 0.82)',
                    strokeWidth: 0.7,
                  }}
                />
              </marker>
            </defs>
            {CAREER_DETAIL_TABS.map((tab) => {
              const isActive = tab.key === selectedTab;

              return (
                <g
                  key={`${tab.key}-connector`}
                  data-career-detail-connector={tab.key}
                  data-career-detail-connector-active={isActive ? 'true' : 'false'}
                >
                  <path
                    d={desktopConnectorPaths[tab.key]}
                    className="transition-[opacity,stroke-dashoffset] duration-500 ease-out"
                    style={{
                      fill: 'none',
                      stroke: 'rgba(116, 92, 67, 0.78)',
                      strokeWidth: 2.05,
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                      opacity: isActive ? 1 : 0,
                      strokeDasharray: '7 10',
                      strokeDashoffset: isActive ? 0 : 17,
                      markerEnd: 'url(#career-detail-connector-arrow)',
                      filter: 'drop-shadow(0 1px 2px rgba(86, 64, 43, 0.1))',
                    }}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {CAREER_DETAIL_TABS.map((tab) => {
          const isActive = tab.key === selectedTab;

          return (
            <button
              key={tab.key}
              type="button"
              data-career-detail-tab-surface="desktop"
              data-career-detail-tab={tab.key}
              aria-label={tab.label}
              aria-pressed={isActive}
              style={desktopTabStyles[tab.key]}
              className={joinClasses(
                'group pointer-events-auto absolute overflow-hidden bg-transparent p-0 text-left outline-none transition-[filter,opacity,transform] duration-500 focus-visible:ring-2 focus-visible:ring-[#73573f]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#efe4d5]',
                isActive
                  ? 'z-20 scale-[1.022] -translate-y-0.5'
                  : 'z-10 opacity-[0.94] hover:-translate-y-1 hover:scale-[1.01] hover:opacity-100',
              )}
              onClick={() => setSelectedTab(tab.key)}
            >
              <img
                src={tab.imageSrc}
                alt=""
                aria-hidden="true"
                draggable={false}
                className={joinClasses(
                  'absolute inset-0 h-full w-full max-w-none transition-[filter,transform] duration-500',
                  isActive
                    ? 'drop-shadow-[0_24px_30px_rgba(58,42,26,0.22)] brightness-[1.045] saturate-[1.04]'
                    : 'drop-shadow-[0_16px_22px_rgba(58,42,26,0.15)] brightness-[0.985] saturate-[0.98] group-hover:brightness-[1.015] group-hover:saturate-[1.01]',
                )}
              />
            </button>
          );
        })}
      </div>

      <div className="relative z-20 mx-auto min-h-[100dvh] max-w-[1600px] px-5 py-8 sm:px-8 lg:px-10">
        <div className="flex min-h-[calc(100dvh-4rem)] flex-col gap-8 lg:hidden">
          <div className="rounded-[2rem] border border-[#8b735c]/15 bg-[#f7f1e7]/84 p-5 shadow-[0_24px_80px_rgba(83,60,37,0.14)] backdrop-blur-[2px]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7d6957]">
              {selectedRecord.locationLine}
            </p>
            <h2
              id="career-detail-date-title"
              data-career-detail-block="date-title"
              className="mt-3 font-serif text-[2.6rem] leading-none tracking-[-0.05em] text-[#2c2118]"
            >
              {selectedRecord.dateTitle}
            </h2>

            <div className="mt-5 flex gap-3 overflow-x-auto pb-1">
              {CAREER_DETAIL_TABS.map((tab) => {
                const isActive = tab.key === selectedTab;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    data-career-detail-tab-surface="mobile"
                    data-career-detail-tab={tab.key}
                    aria-label={tab.label}
                    aria-pressed={isActive}
                    className={joinClasses(
                      'shrink-0 rounded-[1rem] border bg-transparent p-0 outline-none transition-[filter,opacity,transform] duration-300 focus-visible:ring-2 focus-visible:ring-[#73573f]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f1e7]',
                      isActive
                        ? 'scale-[1.02] border-[#8f775f]/22 bg-[rgba(255,249,241,0.38)] shadow-[0_12px_24px_rgba(83,60,37,0.12)]'
                        : 'border-transparent opacity-80 hover:opacity-100',
                    )}
                    onClick={() => setSelectedTab(tab.key)}
                  >
                    <img
                      src={tab.imageSrc}
                      alt=""
                      aria-hidden="true"
                      draggable={false}
                      className={joinClasses(
                        'w-[10rem] transition-[filter,transform] duration-300',
                        isActive ? 'brightness-[1.03]' : 'brightness-[0.98]',
                      )}
                    />
                  </button>
                );
              })}
            </div>

            <label className="mt-5 block">
              <span className="mb-2 block text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#7e6654]">
                Record
              </span>
              <select
                data-career-detail-select="record"
                className="w-full rounded-[1rem] border border-[#8d7660]/25 bg-[#fbf7f1]/90 px-4 py-3 text-sm font-medium text-[#3a2d22] outline-none"
                value={selectedRecord.id}
                onChange={(event) => commitSelectedRecordId(event.target.value)}
              >
                {CAREER_DETAIL_RECORDS.map((record) => (
                  <option key={record.id} value={record.id}>
                    {record.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <article className="rounded-[2rem] border border-[#8b735c]/15 bg-[#f7f1e7]/84 p-5 shadow-[0_24px_80px_rgba(83,60,37,0.14)] backdrop-blur-[2px]">
            <p
              data-career-detail-block="eyebrow"
              className="text-xs font-semibold uppercase tracking-[0.26em] text-[#7e6654]"
            >
              {selectedContent.eyebrow}
            </p>
            <h3 className="mt-3 max-w-[16ch] font-serif text-[2.2rem] leading-[0.94] tracking-[-0.04em] text-[#2d241c]">
              {selectedContent.headline}
            </h3>
            <p
              data-career-detail-block="body"
              className="mt-4 text-[1rem] leading-[1.65] text-[#332821]"
            >
              {selectedContent.body}
            </p>
            <div className="mt-6 rounded-[1.3rem] border border-[#8f775f]/18 bg-white/45 p-4">
              <p className="font-serif text-[1.4rem] leading-none tracking-[-0.03em] text-[#2f251d]">
                {selectedContent.supportingTitle}
              </p>
              <p className="mt-3 text-[0.98rem] leading-[1.6] text-[#3c2f24]">
                {selectedContent.supportingBody}
              </p>
            </div>
            <p className="mt-4 text-sm italic leading-[1.5] text-[#5e4d40]">
              {selectedContent.annotation}
            </p>
          </article>
        </div>

        <div className="relative hidden min-h-[calc(100dvh-4rem)] lg:block">
          <div className="absolute left-[35%] top-[2.5%] w-[44%]">
            <p className="text-[0.82rem] font-semibold uppercase tracking-[0.28em] text-[#7f6854]">
              {selectedRecord.locationLine}
            </p>
            <h2
              id="career-detail-date-title"
              data-career-detail-block="date-title"
              className="mt-3 font-serif text-[clamp(3.6rem,4.2vw,4.8rem)] leading-none tracking-[-0.06em] text-[#241b14]"
            >
              {selectedRecord.dateTitle}
            </h2>
          </div>

          <div
            data-career-detail-selector="desktop"
            className="absolute right-[0.9%] top-[10.5%] z-20 flex h-[68%] w-[6.2rem] items-center justify-center"
          >
            <select
              data-career-detail-select="record"
              aria-label="Career detail record"
              className="sr-only"
              value={selectedRecord.id}
              onChange={(event) => commitSelectedRecordId(event.target.value)}
            >
              {CAREER_DETAIL_RECORDS.map((record) => (
                <option key={record.id} value={record.id}>
                  {record.label}
                </option>
              ))}
            </select>

            <div
              data-career-detail-drag-track="desktop"
              className="absolute inset-y-[8%] left-1/2 z-10 w-[2.6rem] -translate-x-1/2 touch-none"
              onPointerDown={handleSelectorPointerDown}
              onPointerMove={handleSelectorPointerMove}
              onPointerUp={handleSelectorPointerUp}
              onPointerCancel={handleSelectorPointerUp}
              onLostPointerCapture={resetSelectorDrag}
            >
              <div
                data-career-detail-drag-thumb="desktop"
                style={selectorThumbStyle}
                className={joinClasses(
                  'absolute left-1/2 flex h-[7rem] w-[2rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center transition-[top,transform] duration-300',
                  isSelectorDragging
                    ? 'cursor-grabbing scale-[1.03]'
                    : 'cursor-grab',
                )}
              >
                <img
                  data-career-detail-drag-thumb-icon="desktop"
                  src={CAREER_DETAIL_ASSETS.scrollSelector}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  className="pointer-events-none h-auto max-h-full w-[2rem] object-contain drop-shadow-[0_10px_24px_rgba(92,69,45,0.18)]"
                />
              </div>
            </div>

            <div className="absolute inset-y-[8%] right-[10%] flex flex-col items-center justify-between">
              {CAREER_DETAIL_RECORDS.map((record) => {
                const isSelected = record.id === selectedRecord.id;

                return (
                  <button
                    key={record.id}
                    type="button"
                    data-career-detail-record-button={record.id}
                    aria-label={record.label}
                    aria-pressed={isSelected}
                    className={joinClasses(
                      'rounded-full px-2 py-1 text-[0.72rem] font-medium tracking-[0.08em] text-[#5f4d3f] transition-all duration-300 [writing-mode:vertical-rl]',
                      isSelected
                        ? 'bg-[rgba(247,241,231,0.88)] text-[#2e241b] shadow-[0_8px_18px_rgba(92,69,45,0.12)]'
                        : 'bg-[rgba(247,241,231,0.55)] hover:bg-[rgba(247,241,231,0.75)]',
                    )}
                    onClick={() => commitSelectedRecordId(record.id)}
                  >
                    {record.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            data-career-detail-card-stack="desktop"
            className="absolute left-[37%] top-[22%] flex w-[29%] flex-col"
          >
            <div>
              <p
                data-career-detail-block="eyebrow"
                className="text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-[#7f6853]"
              >
                {selectedContent.eyebrow}
              </p>
              <h3 className="mt-3 max-w-[16ch] font-serif text-[clamp(1.8rem,2vw,2.2rem)] leading-[0.92] tracking-[-0.04em] text-[#251c15]">
                {selectedContent.headline}
              </h3>
              <p
                data-career-detail-block="body"
                className="mt-4 text-[0.92rem] leading-[1.5] text-[#322720]"
              >
                {selectedContent.body}
              </p>
            </div>

            <div className="mt-6">
              <h4 className="font-serif text-[clamp(1.6rem,1.8vw,2rem)] leading-[0.95] tracking-[-0.04em] text-[#261d16]">
                {selectedContent.supportingTitle}
              </h4>
              <p className="mt-3 text-[0.9rem] leading-[1.5] text-[#342821]">
                {selectedContent.supportingBody}
              </p>
            </div>
          </div>

          <aside className="absolute right-[7.5%] top-[19.5%] w-[25%] rounded-[0.55rem] border border-[#8f775f]/20 bg-[rgba(247,242,234,0.58)] p-5 shadow-[0_20px_46px_rgba(68,50,35,0.07)]">
            <span
              data-career-detail-block="classified"
              className="absolute right-4 top-3 text-[0.65rem] uppercase tracking-[0.3em] text-[#7f6854]/50"
            >
              CLASSIFIED
            </span>
            <div className="mt-2 aspect-[0.83/1] w-full overflow-hidden rounded-[0.3rem] border border-[#8f775f]/18 bg-[rgba(255,255,255,0.28)]">
              <img
                src={CAREER_DETAIL_ASSETS.map}
                alt="Topographic map"
                className="h-full w-full object-cover"
              />
            </div>
            <p className="mt-2 text-[0.7rem] text-[#7f6854]">X: 14.22 / 9-98.11</p>
            <p className="text-[0.7rem] italic text-[#7f6854]">&quot;Magnetic variance noted&quot;</p>
            <p className="mt-4 text-sm leading-[1.55] italic text-[#5f4d3f]">
              {selectedContent.annotation}
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
