import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';

import { personalData } from '../data';
import WorksDetailSection from './WorksDetailSection';

test('renders the works detail transition stage with loading iframe and hidden background scene', () => {
  const markup = renderToStaticMarkup(<WorksDetailSection />);

  assert.match(markup, /id="works-detail-section"/);
  assert.match(markup, /data-works-detail-stage="transition"/);
  assert.match(markup, /data-works-detail-phase="idle"/);
  assert.match(markup, /\/detailWork-loading\.html\?embed=portfolio/);
  assert.match(markup, /\/images\/workDetail_bg\.jpeg/);
  assert.match(markup, />ON</);
  assert.match(markup, />ON</);
  assert.match(markup, />CODING</);
  assert.match(markup, />DESIGN</);
  assert.doesNotMatch(markup, />TRACK</);
  assert.match(markup, /Fusing concepts in mind with art and bringing them into life/);
  assert.match(markup, /Workflows and prototypes built to make ideas actually run/);
  assert.match(markup, /\/images\/workDetail_left_icon\.png\.png/);
  assert.match(markup, /\/images\/workDetail_rigtht_icon\.png/);
  assert.match(markup, /aria-label="Open On Track collection"/);
  assert.match(markup, /aria-label="Open Off Track collection"/);
  assert.doesNotMatch(markup, /Signal in Motion/);
  assert.doesNotMatch(markup, /Open the case/);
  assert.doesNotMatch(markup, /data-works-detail-nav="rail"/);
  assert.doesNotMatch(markup, /linear-gradient\(rgba\(0, 0, 0, 0\.18\), rgba\(0, 0, 0, 0\.28\)\)/);
  assert.doesNotMatch(markup, /radial-gradient\(circle_at_center/);
});

test('renders the in-page detail view with a close button when the left entry has been opened', () => {
  const markup = renderToStaticMarkup(
    <WorksDetailSection initialPhase="settled" initialView="detail" initialTransitionProgress={1} />,
  );

  assert.match(markup, /data-works-detail-view="detail"/);
  assert.match(markup, /data-works-detail-scene="gallery"/);
  assert.match(markup, /aria-label="Close work detail"/);
  assert.match(markup, /works-detail-stage/);
  assert.doesNotMatch(markup, /works-detail-stage__close-dock/);
  assert.match(markup, /works-detail-stage__footer-center/);
  assert.match(markup, /data-project-state="muted">/);
  assert.match(markup, /data-project-state="active">/);
  assert.match(markup, /data-visibility="preview"/);
  assert.match(markup, /data-visibility="active"/);
  assert.match(markup, /data-detail-scene-panel="gallery"/);
  assert.match(markup, /data-scene-active="true"/);
  assert.match(markup, />04</);
  assert.match(markup, />05</);
  assert.match(markup, /data-active="true"/);
  assert.match(markup, /data-slot="3" data-active="true"[^>]*aria-label="Open First Light in AI project"/);
  assert.match(markup, /data-active="true"[^>]*aria-label="Open First Light in AI project"/);
  assert.match(markup, /\/images\/VisualWorks\/VisualWorks_Myfirst_cg\.jpeg/);
  assert.match(markup, new RegExp(personalData.featuredWorks[1]!.title));
  assert.match(markup, new RegExp(personalData.featuredWorks[2]!.title));
  assert.match(markup, new RegExp(personalData.featuredWorks[3]!.title));
  assert.match(
    markup,
    new RegExp(
      personalData.featuredWorks[1]!.subtitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    ),
  );
  assert.doesNotMatch(markup, />SANOFI</);
  assert.match(markup, />VisualMemory</);
  assert.match(
    markup,
    /data-works-detail-layer="content" class="absolute inset-0 flex items-center justify-center"/,
  );
  assert.doesNotMatch(
    markup,
    /data-works-detail-layer="content" class="absolute inset-0 flex items-center justify-center px-4 sm:px-8"/,
  );
  assert.doesNotMatch(markup, /data-works-detail-nav="rail"/);
});

test('detail markup includes a fullscreen project scene with the active work image, title, and description', () => {
  const markup = renderToStaticMarkup(
    <WorksDetailSection initialPhase="settled" initialView="detail" initialTransitionProgress={1} />,
  );

  assert.match(markup, /data-detail-scene-panel="project"/);
  assert.match(markup, /works-detail-project__panel/);
  assert.match(markup, /works-detail-project__backdrop/);
  assert.match(markup, /works-detail-project__media/);
  assert.match(markup, /data-project-image-mode="contained"/);
  assert.match(markup, /works-detail-project__background-image/);
  assert.match(markup, /works-detail-project__image/);
  assert.match(markup, /works-detail-project__meta/);
  assert.match(
    markup,
    new RegExp(personalData.featuredWorks[0]!.eyebrow.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
  );
  assert.match(
    markup,
    new RegExp(personalData.featuredWorks[0]!.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
  );
  assert.match(
    markup,
    new RegExp(
      personalData.featuredWorks[0]!.description.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    ),
  );
  assert.doesNotMatch(markup, />Get In Touch</);
  assert.doesNotMatch(markup, />Say Hello</);
  assert.doesNotMatch(markup, />MENU</);
});

test('uses contained project media for the two vertical works that need full-image previews', () => {
  const componentSource = readFileSync('src/components/WorksDetailSection.tsx', 'utf8');

  assert.match(componentSource, /WORKS_DETAIL_CONTAINED_PROJECT_IMAGE_SRCS/);
  assert.match(componentSource, /\/images\/VisualWorks\/VisualWorks_Myfirst_cg\.jpeg/);
  assert.match(componentSource, /\/images\/VisualWorks\/VisualWorks_TakePhoto_Night\.jpeg/);
  assert.match(componentSource, /data-project-image-mode=\{shouldContainProjectImage \? 'contained' : 'cover'\}/);
});

test('uses the real VisualMemory works in narrative order', () => {
  assert.equal(personalData.featuredWorks.length, 10);
  assert.deepEqual(
    personalData.featuredWorks.map((work) => work.image),
    [
      '/images/VisualWorks/VisualWorks_Myfirst_cg.jpeg',
      '/images/VisualWorks/VisualWorks_MJ_Ocean.jpeg',
      '/images/VisualWorks/VisualWorks_MJ_Earth.jpeg',
      '/images/VisualWorks/VisualWorks_ComfyUI_theLazygirl.jpeg',
      '/images/VisualWorks/VisualWorks_OilPatiner.jpeg',
      '/images/VisualWorks/VisualWorks_circlVideo.jpeg',
      '/images/VisualWorks/VisualWorks_happyNewYork.jpeg',
      '/images/VisualWorks/VisualWorks_IP_Mearge.jpeg',
      '/images/VisualWorks/VisualWorks_TakePhoto.jpeg',
      '/images/VisualWorks/VisualWorks_TakePhoto_Night.jpeg',
    ],
  );
  assert.equal(personalData.featuredWorks[0]!.title, 'First Light in AI');
  assert.equal(personalData.featuredWorks[9]!.title, 'Night Sense');
});

test('uses real coding project material instead of placeholder project cards', () => {
  const allCodingProjects = Object.values(personalData.codingProjects).flat();
  const codingMarkup = renderToStaticMarkup(
    <WorksDetailSection
      initialPhase="settled"
      initialView="detail"
      initialDetailMode="coding"
      initialTransitionProgress={1}
    />,
  );

  assert.equal(personalData.codingProjects.workflow.length, 3);
  assert.equal(personalData.codingProjects.vibecoding.length, 5);
  assert.equal(personalData.codingProjects['ai-product'].length, 3);
  assert.equal(personalData.codingProjects.workflow[0]!.title, 'ComfyUI AIGC Creation Workflow');
  assert.equal(personalData.codingProjects.vibecoding[0]!.title, 'Professional Portfolio');
  assert.equal(personalData.codingProjects['ai-product'][0]!.title, 'AIGC Insight Vault');
  assert.equal(personalData.codingProjects.workflow[0]!.image, '/images/CodingWorks/comfyui-aigc-workflow-cover.svg');
  assert.equal(personalData.codingProjects.workflow[0]!.link, '#');
  assert.equal(personalData.codingProjects.workflow[1]!.title, 'Coze Social Data Fetch Workflow');
  assert.equal(personalData.codingProjects.workflow[1]!.image, '/images/CodingWorks/Coze_SocialDataFetch.png');
  assert.equal(
    personalData.codingProjects.workflow[1]!.link,
    'https://www.coze.cn/work_flow?bot_id=7468859639569186879&space_id=7463017999541207052&workflow_id=7467024551915782180',
  );
  assert.equal(personalData.codingProjects.workflow[2]!.image, "/images/CodingWorks/XiaoHongShu'sTranslation.png");
  assert.equal(
    personalData.codingProjects.workflow[2]!.description,
    'A translation and reply workflow for the wave of international users who entered Xiaohongshu during the TikTok ban scare.',
  );
  assert.equal(personalData.codingProjects.vibecoding[0]!.image, '/images/CodingWorks/portfolioWorks.jpg');
  assert.equal(personalData.codingProjects.vibecoding[0]!.link, 'http://xiaoci-ai.com/');
  assert.equal(personalData.codingProjects.vibecoding[1]!.title, 'Shopping');
  assert.equal(personalData.codingProjects.vibecoding[1]!.image, '/images/CodingWorks/shopping-vibecoding-cover.svg');
  assert.equal(personalData.codingProjects.vibecoding[1]!.link, 'https://github.com/S313S/shopping');
  assert.equal(personalData.codingProjects.vibecoding[2]!.title, 'OpenClaw Backup Skill');
  assert.equal(personalData.codingProjects.vibecoding[2]!.image, '/images/CodingWorks/openclaw-backup-skill.png');
  assert.equal(personalData.codingProjects.vibecoding[2]!.link, 'https://github.com/S313S/openclaw-backup-skill');
  assert.equal(personalData.codingProjects.vibecoding[3]!.image, '/images/CodingWorks/vibe-coding-workstation-cover.svg');
  assert.equal(
    personalData.codingProjects.vibecoding[3]!.link,
    'https://github.com/S313S/vibe-coding-cn',
  );
  assert.equal(personalData.codingProjects.vibecoding[4]!.title, 'AI Teaching Video & Interactive Lesson');
  assert.equal(
    personalData.codingProjects.vibecoding[4]!.image,
    '/images/CodingWorks/Al TeachingVideo.png',
  );
  assert.equal(
    personalData.codingProjects.vibecoding[4]!.description,
    "A vibe-coded learning prototype that turns a learner's question into an auto-play HTML teaching animation and interactive lesson.",
  );
  assert.equal(
    personalData.codingProjects['ai-product'][0]!.image,
    '/images/CodingWorks/AIGC_InsightVault_dashboard.png',
  );
  assert.equal(personalData.codingProjects['ai-product'][0]!.link, 'https://aigc-insight-vault.vercel.app/');
  assert.equal(
    personalData.codingProjects['ai-product'][1]!.image,
    '/images/CodingWorks/Visual Bridge Assistance_chat.png',
  );
  assert.equal(personalData.codingProjects['ai-product'][1]!.link, 'https://s313s.github.io/Visual-Bridge-V2/');
  assert.equal(personalData.codingProjects['ai-product'][2]!.image, '/images/CodingWorks/pd-data-analyst.png');
  assert.equal(personalData.codingProjects['ai-product'][2]!.link, '#');
  assert.equal(
    personalData.codingCategories[0]!.description,
    'Node-based AI workflows built with ComfyUI, Coze, and Wordware to connect inputs, model steps, data handling, and repeatable outputs.',
  );
  assert.equal(
    personalData.codingCategories[1]!.description,
    'AI-assisted builds outside the workflow and product buckets: portfolio systems, commerce demos, reusable skills, and learning workstations.',
  );
  assert.equal(
    personalData.codingCategories[2]!.description,
    'Deployed or product-shaped AI applications with persistent data, structured interaction logic, and clear user workflows.',
  );
  assert.match(codingMarkup, /ComfyUI AIGC Creation Workflow/);
  assert.match(codingMarkup, /node-based AIGC image and video creation workflow/i);
  assert.match(
    codingMarkup,
    /<img src="\/images\/CodingWorks\/comfyui-aigc-workflow-cover\.svg" alt="ComfyUI AIGC Creation Workflow"/,
  );
  assert.match(codingMarkup, /loading="eager"/);
  assert.doesNotMatch(codingMarkup, /Handoff Radar|Prompt QA Sheet|Motion Sprint|Agent Console|Quality Filter Spec|Cron Monitor/);
  assert.ok(allCodingProjects.every((project) => project.link === '#' || project.link.startsWith('http')));
  assert.ok(existsSync('public/images/CodingWorks/openclaw-backup-skill.png'));
  assert.ok(existsSync('public/images/CodingWorks/comfyui-aigc-workflow-cover.svg'));
  assert.ok(existsSync('public/images/CodingWorks/shopping-vibecoding-cover.svg'));
  assert.ok(existsSync('public/images/CodingWorks/vibe-coding-workstation-cover.svg'));
  assert.ok(existsSync('public/images/CodingWorks/Al TeachingVideo.png'));
  assert.equal(new Set(allCodingProjects.map((project) => project.image)).size, allCodingProjects.length);
});

test('keeps the left entry button clickable once the reveal is visually complete', () => {
  const markup = renderToStaticMarkup(
    <WorksDetailSection initialPhase="revealing" initialTransitionProgress={0.8} />,
  );

  assert.match(markup, /pointer-events:auto/);
  assert.match(markup, /aria-label="Open On Track collection" tabindex="0"/);
});

test('transparent loading fallback does not keep intercepting clicks after the transition settles', () => {
  const markup = renderToStaticMarkup(
    <WorksDetailSection initialPhase="settled" initialTransitionProgress={1} />,
  );

  assert.match(markup, /data-works-detail-layer="loading"/);
  assert.match(markup, /opacity:0;pointer-events:none/);
});

test('entry overlay becomes section-bound after settling so the next page can scroll into view', () => {
  const markup = renderToStaticMarkup(
    <WorksDetailSection initialPhase="settled" initialTransitionProgress={1} />,
  );

  assert.match(markup, /id="works-detail-section"/);
  assert.match(markup, /class="relative [^"]*bg-black[^"]*text-\[#f5efe6\][^"]*min-h-screen"/);
  assert.match(
    markup,
    /class="absolute inset-0 z-50 overflow-hidden bg-black transition-opacity duration-200 pointer-events-auto opacity-100"/,
  );
  assert.doesNotMatch(
    markup,
    /class="fixed inset-0 z-50 overflow-hidden bg-black transition-opacity duration-200 pointer-events-auto opacity-100"/,
  );
});

test('settled entry view exposes a dedicated landing-animation hook for the auto-revealed attachment page', () => {
  const markup = renderToStaticMarkup(
    <WorksDetailSection initialPhase="settled" initialTransitionProgress={1} />,
  );

  assert.match(markup, /data-works-detail-entry-landing="visible"/);
  assert.match(markup, /data-works-detail-entry-landing-layer="background"/);
  assert.match(markup, /data-works-detail-entry-landing-layer="content"/);
});

test('keeps the current text blocks edge-aligned with equalized description heights', () => {
  const markup = renderToStaticMarkup(<WorksDetailSection />);
  const minHeightMatches = markup.match(/min-h-\[3\.8rem\]/g) ?? [];

  assert.match(
    markup,
    /class="flex flex-col items-end translate-y-\[6px\]"/,
  );
  assert.match(
    markup,
    /class="flex flex-col items-start translate-y-\[6px\]"/,
  );
  assert.match(
    markup,
    /Workflows and prototypes built to make ideas actually run<\/p>/,
  );
  assert.match(markup, /Fusing concepts in mind with art and bringing them into life<\/p>/);
  assert.equal(minHeightMatches.length, 2);
});

test('renders the coding detail mode with a new background, draggable category cards, and the active project grid', () => {
  const markup = renderToStaticMarkup(
    <WorksDetailSection
      initialPhase="settled"
      initialView="detail"
      initialTransitionProgress={1}
      initialDetailMode="coding"
    />,
  );
  const componentSource = readFileSync(new URL('./WorksDetailSection.tsx', import.meta.url), 'utf8');
  const dataSource = readFileSync(new URL('../data.tsx', import.meta.url), 'utf8');
  const codingProjectInterface = dataSource.match(/export interface CodingProjectCard \{[\s\S]*?\n\}/)?.[0] ?? '';

  assert.match(markup, /data-works-detail-detail-mode="coding"/);
  assert.match(markup, /data-detail-scene-panel="coding"/);
  assert.match(markup, /data-scene-active="true"/);
  assert.match(markup, /\/images\/careerDetail_bg\.png/);
  assert.doesNotMatch(markup, /\/images\/workDetail_bg\.jpeg/);
  assert.match(markup, /workflow/i);
  assert.match(markup, /vibecoding/i);
  assert.match(markup, /AI product/i);
  assert.match(markup, /data-coding-card-drag-hint="true"/);
  assert.match(markup, /data-coding-category-card="workflow"/);
  assert.match(markup, /data-coding-category-card="vibecoding"/);
  assert.match(markup, /data-coding-category-card="ai-product"/);
  assert.match(markup, /data-coding-category-card-draggable="true"/);
  assert.match(markup, /data-coding-category-card-draggable="false"/);
  assert.match(markup, /data-coding-project-grid="workflow"/);
  assert.match(markup, /data-coding-project-grid-state="list"/);
  assert.match(markup, /data-coding-project-card=/);
  assert.match(markup, /data-coding-project-expanded="false"/);
  assert.match(markup, /aria-expanded="false"/);
  assert.doesNotMatch(markup, /target="_blank"/);
  assert.match(componentSource, /activeCodingProjectId/);
  assert.match(componentSource, /data-coding-project-expanded/);
  assert.match(componentSource, /project\.detail\.problem/);
  assert.match(componentSource, /project\.detail\.approach/);
  assert.match(componentSource, /project\.detail\.outcome/);
  assert.doesNotMatch(componentSource, /project\.detail\.role/);
  assert.doesNotMatch(componentSource, /project\.detail\.deliverables/);
  assert.match(dataSource, /problem:/);
  assert.match(dataSource, /approach:/);
  assert.match(dataSource, /outcome:/);
  assert.doesNotMatch(codingProjectInterface, /role:/);
  assert.doesNotMatch(codingProjectInterface, /deliverables:/);
  assert.doesNotMatch(markup, /Design in action/i);
  assert.doesNotMatch(markup, /Six selected builds from the/i);
  const codingCards = markup.match(/data-coding-project-card=/g) ?? [];
  assert.equal(codingCards.length, 3);
});

test('renders only the active coding project when a coding card is expanded', () => {
  const markup = renderToStaticMarkup(
    <WorksDetailSection
      initialPhase="settled"
      initialView="detail"
      initialTransitionProgress={1}
      initialDetailMode="coding"
      initialActiveCodingProjectId="comfyui-aigc-workflow"
    />,
  );
  const componentSource = readFileSync(new URL('./WorksDetailSection.tsx', import.meta.url), 'utf8');

  assert.match(markup, /data-coding-project-grid-state="expanded"/);
  assert.match(markup, /data-coding-project-card="comfyui-aigc-workflow"/);
  assert.match(markup, /data-coding-project-expanded="true"/);
  assert.match(markup, /aria-expanded="true"/);
  assert.doesNotMatch(markup, /works-detail-coding__project-title-link/);
  assert.doesNotMatch(componentSource, /window\.open\(project\.link/);
  assert.doesNotMatch(markup, /lucide-external-link/);
  assert.doesNotMatch(markup, />Open project</);
  assert.match(componentSource, /ExternalLink/);
  assert.match(componentSource, /works-detail-coding__project-title-row/);
  assert.match(markup, />Problem</);
  assert.match(markup, />Approach</);
  assert.match(markup, />Outcome</);
  assert.doesNotMatch(markup, /data-coding-project-card="coze-social-data-fetch"/);
  assert.doesNotMatch(markup, /data-coding-project-muted="true"/);
  const codingCards = markup.match(/data-coding-project-card=/g) ?? [];
  assert.equal(codingCards.length, 1);
});

test('keeps category switching clickable by limiting drag capture to the active coding card only', () => {
  const componentSource = readFileSync(new URL('./WorksDetailSection.tsx', import.meta.url), 'utf8');

  assert.doesNotMatch(
    componentSource,
    /className="works-detail-coding__stack"[\s\S]*onPointerDown=\{handleCodingDragStart\}/,
  );
  assert.match(
    componentSource,
    /data-coding-category-card-draggable=\{[\s\S]*category\.id === activeCodingCategory\?\.id[\s\S]*'true' : 'false'[\s\S]*\}/,
  );
  assert.match(
    componentSource,
    /onPointerDown=\{[\s\S]*category\.id === activeCodingCategory\?\.id[\s\S]*handleCodingDragStart : undefined[\s\S]*\}/,
  );
});

test('exposes dedicated tuning hooks for each icon button size and vertical position', () => {
  const entryMarkup = renderToStaticMarkup(<WorksDetailSection />);
  const codingMarkup = renderToStaticMarkup(
    <WorksDetailSection
      initialPhase="settled"
      initialView="detail"
      initialTransitionProgress={1}
      initialDetailMode="coding"
    />,
  );
  const componentSource = readFileSync(new URL('./WorksDetailSection.tsx', import.meta.url), 'utf8');

  assert.match(entryMarkup, /data-works-detail-icon-button="left"/);
  assert.match(entryMarkup, /data-works-detail-icon-button="right"/);
  assert.match(componentSource, /WORKS_DETAIL_BUTTON_LAYOUT/);
  assert.match(componentSource, /iconSizeClassName/);
  assert.match(componentSource, /buttonSpacingClassName/);
  assert.match(componentSource, /buttonOffsetClassName/);
  assert.match(componentSource, /WORKS_DETAIL_CODING_LAYOUT/);
  assert.match(componentSource, /--works-detail-coding-projects-offset-y/);
  assert.match(componentSource, /--works-detail-coding-projects-max-width/);
  assert.match(componentSource, /--works-detail-coding-projects-padding-inline/);
  assert.match(componentSource, /--works-detail-coding-projects-gap/);
  assert.match(codingMarkup, /--works-detail-coding-projects-max-width:/);
  assert.match(codingMarkup, /--works-detail-coding-projects-padding-inline:/);
  assert.match(codingMarkup, /--works-detail-coding-projects-gap:/);
});

test('matches the approved works gallery footer spacing, socials format, and film corridor structure', () => {
  const markup = renderToStaticMarkup(
    <WorksDetailSection initialPhase="settled" initialView="detail" initialTransitionProgress={1} />,
  );
  const componentSource = readFileSync(new URL('./WorksDetailSection.tsx', import.meta.url), 'utf8');

  assert.match(
    markup,
    /class="works-detail-stage relative flex h-full w-full flex-col overflow-hidden px-5 pt-6 pb-10 text-\[#f8ebdb\] sm:px-8 sm:pt-8 sm:pb-12"/,
  );
  assert.match(markup, /works-detail-track__corridor works-detail-track__corridor--band/);
  assert.match(markup, /works-detail-track__corridor works-detail-track__corridor--top/);
  assert.match(markup, /works-detail-track__corridor works-detail-track__corridor--bottom/);
  assert.match(markup, /class="works-detail-gallery__visual-plane"/);
  assert.match(markup, /class="works-detail-track__corridor-layer"/);
  assert.match(markup, /--works-detail-gallery-plane-width:1406px/);
  assert.match(markup, /--works-detail-gallery-plane-height:755px/);
  assert.doesNotMatch(markup, />f \| t \| ▶</);
  assert.match(markup, /href="https:\/\/uixp8a9di3s\.feishu\.cn\/docx\/TLNpdBRkEoiOvkxnEQMcEy5rnLh"/);
  assert.match(markup, /target="_blank"/);
  assert.match(markup, /rel="noreferrer"/);
  assert.match(markup, /data-tooltip="See more work details in Feishu Docs"/);
  assert.match(markup, /aria-label="See more work details in Feishu Docs"/);
  assert.match(markup, /data-tooltip="Personal social media platform"/);
  assert.match(markup, /aria-label="Personal social media platform"/);
  assert.match(markup, />x<\/button>/);
  assert.match(componentSource, /const FEISHU_PORTFOLIO_URL =/);
  assert.match(componentSource, /const XHS_PROFILE_CARD_SRC = '\/images\/xhsMainPage_Link\.jpeg';/);
  assert.match(componentSource, /const WORKS_DETAIL_STAGE_SOCIAL_LINKS =/);
  assert.match(componentSource, /setIsXhsCardOpen\(true\)/);
  assert.match(componentSource, /Xiaohongshu profile QR code card/);
  assert.match(componentSource, /from 'gsap'/);
  assert.match(componentSource, /const WORKS_DETAIL_GALLERY_LAYOUT = \{/);
  assert.match(componentSource, /'--works-detail-projects-offset-x'/);
  assert.match(componentSource, /'--works-detail-projects-offset-y'/);
  assert.match(componentSource, /'--works-detail-corridor-center-y'/);
  assert.match(componentSource, /'--works-detail-corridor-rail-offset':\s*'10\.75rem'/);
  assert.doesNotMatch(componentSource, /'--works-detail-corridor-rail-offset':\s*'8\.75rem'/);
  assert.match(componentSource, /'--works-detail-slot-x'/);
});

test('keeps the works gallery dashed SVG grid and socials styling aligned with the approved css treatment', () => {
  const cssSource = readFileSync(new URL('../index.css', import.meta.url), 'utf8');

  assert.match(cssSource, /\.works-detail-stage__grid\s*\{[\s\S]*background-image:\s*url\("data:image\/svg\+xml,/);
  assert.match(cssSource, /\.works-detail-stage__grid\s*\{[\s\S]*stroke-dasharray='8,6'/);
  assert.match(cssSource, /\.works-detail-stage__grid\s*\{[\s\S]*background-size:\s*260px 260px;/);
  assert.match(cssSource, /\.works-detail-stage__grid\s*\{[\s\S]*background-position:\s*[^;]+;/);
  assert.match(cssSource, /\.works-detail-stage__grid\s*\{[\s\S]*opacity:\s*0\.6;/);
  assert.match(
    cssSource,
    /\.works-detail-gallery__visual-plane\s*\{[\s\S]*scale\(var\(--works-detail-gallery-plane-scale,\s*1\)\)/,
  );
  assert.doesNotMatch(cssSource, /\.works-detail-stage__grid\s*\{[\s\S]*repeating-linear-gradient\(/);
  assert.match(
    cssSource,
    /\.works-detail-track__corridor--top,\s*\.works-detail-track__corridor--bottom\s*\{[\s\S]*border-top:\s*1\.5px dashed rgba\(200, 210, 220, 0\.25\);/,
  );
  assert.match(cssSource, /\.works-detail-stage__socials\s*\{[\s\S]*text-transform:\s*none;/);
  assert.match(
    cssSource,
    /\.works-detail-project__panel\s*\{[\s\S]*inset:\s*-2rem -2rem -3rem;/,
  );
  assert.match(
    cssSource,
    /\.works-detail-project__media\s*\{[\s\S]*inset:\s*0;/,
  );
  assert.match(
    cssSource,
    /\.works-detail-project__image\s*\{[\s\S]*object-fit:\s*cover;/,
  );
  assert.match(
    cssSource,
    /\.works-detail-project__background-image\s*\{[^}]*filter:\s*blur\(24px\);/,
  );
  assert.match(
    cssSource,
    /\.works-detail-project__background-image\s*\{[^}]*pointer-events:\s*none;/,
  );
  assert.match(
    cssSource,
    /\.works-detail-project__media\[data-project-image-mode='contained'\]\s+\.works-detail-project__image\s*\{[^}]*pointer-events:\s*none;/,
  );
  assert.match(
    cssSource,
    /\.works-detail-project__media\[data-project-image-mode='contained'\]\s+\.works-detail-project__image\s*\{[^}]*object-fit:\s*contain;/,
  );
  assert.match(
    cssSource,
    /\.works-detail-project__meta\s*\{[\s\S]*inset:\s*auto 0 0 0;[\s\S]*background:/,
  );
  assert.match(
    cssSource,
    /\.works-detail-scene-shell\s*\{[\s\S]*min-height:\s*0;/,
  );
  assert.match(
    cssSource,
    /\.works-detail-coding__panel\s*\{[\s\S]*overflow-y:\s*auto;/,
  );
  assert.match(
    cssSource,
    /\.works-detail-coding__panel\s*\{[\s\S]*padding-bottom:\s*5\.5rem;/,
  );
  assert.match(
    cssSource,
    /\.works-detail-coding__hero\s*\{[\s\S]*gap:\s*1\.5rem;/,
  );
  assert.match(
    cssSource,
    /\.works-detail-coding__projects-grid\s*\{[\s\S]*margin-top:\s*var\(--works-detail-coding-projects-offset-y,\s*20px\);/,
  );
  assert.match(
    cssSource,
    /\.works-detail-coding__hero\s*\{[\s\S]*min-height:\s*17rem;/,
  );
});

test('hides inactive coding card body copy so back-stack text does not bleed through the active card', () => {
  const cssSource = readFileSync(new URL('../index.css', import.meta.url), 'utf8');

  assert.match(
    cssSource,
    /\.works-detail-coding__category-card\[data-active="false"\]\s+\.works-detail-coding__category-copy\s*\{[\s\S]*opacity:\s*0;/,
  );
});

test('keeps expanded coding project cards compact enough to fit in a single viewport', () => {
  const cssSource = readFileSync(new URL('../index.css', import.meta.url), 'utf8');

  assert.match(
    cssSource,
    /\.works-detail-coding__project-card\[data-coding-project-expanded="true"\]\s*\{[\s\S]*max-height:\s*min\(48rem,\s*calc\(100vh - 4\.5rem\)\);/,
  );
  assert.match(
    cssSource,
    /\.works-detail-coding__project-card\[data-coding-project-expanded="true"\]\s+\.works-detail-coding__project-media\s*\{[\s\S]*height:\s*clamp\(14rem,\s*40vh,\s*21rem\);/,
  );
  assert.match(
    cssSource,
    /\.works-detail-coding__project-card\[data-coding-project-expanded="true"\]\s+\.works-detail-coding__project-detail\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*0\.85fr\)\s*minmax\(0,\s*1\.35fr\);/,
  );
  assert.match(
    cssSource,
    /\.works-detail-coding__project-card\[data-coding-project-expanded="true"\]\s+\.works-detail-coding__project-detail-section:nth-child\(2\)\s*\{[\s\S]*grid-column:\s*2;[\s\S]*grid-row:\s*1\s*\/\s*span 2;/,
  );
  assert.match(
    cssSource,
    /\.works-detail-coding__project-card\[data-coding-project-expanded="true"\]\s+\.works-detail-coding__project-detail-section:nth-child\(3\)\s*\{[\s\S]*grid-column:\s*1;[\s\S]*grid-row:\s*2;/,
  );
  assert.doesNotMatch(
    cssSource,
    /\.works-detail-coding__project-card\[data-coding-project-expanded="true"\]\s+\.works-detail-coding__project-media\s*\{[\s\S]*aspect-ratio:\s*16\s*\/\s*7\.6;/,
  );
});

test('keeps coding project images in normal flow inside a stable media frame', () => {
  const cssSource = readFileSync(new URL('../index.css', import.meta.url), 'utf8');
  const componentSource = readFileSync(new URL('./WorksDetailSection.tsx', import.meta.url), 'utf8');

  assert.match(
    cssSource,
    /\.works-detail-coding__project-media\s*\{[\s\S]*position:\s*relative;[\s\S]*flex:\s*0\s+0\s+auto;/,
  );
  assert.match(
    cssSource,
    /\.works-detail-coding__project-image\s*\{[\s\S]*display:\s*block;[\s\S]*object-fit:\s*cover;/,
  );
  assert.doesNotMatch(
    componentSource,
    /className="works-detail-coding__project-media"[\s\S]{0,120}style=\{\{ backgroundImage:/,
  );
});

test('uses a night-sky palette with star field styling for the coding detail stage', () => {
  const cssSource = readFileSync(new URL('../index.css', import.meta.url), 'utf8');

  assert.match(
    cssSource,
    /\.works-detail-stage--coding\s*\{[\s\S]*linear-gradient\(180deg,\s*#02030a 0%,\s*#07111f 48%,\s*#03050b 100%\);/,
  );
  assert.match(
    cssSource,
    /\.works-detail-stage--coding\s*\{[\s\S]*radial-gradient\(circle at 18% 24%,\s*rgba\(255,\s*255,\s*255,\s*0\.9\)\s*0 1\.2px,\s*transparent 1\.8px\)/,
  );
  assert.match(
    cssSource,
    /\.works-detail-stage--coding\s*\{[\s\S]*radial-gradient\(circle at 32% 62%,\s*rgba\(255,\s*255,\s*255,\s*0\.72\)\s*0 1px,\s*transparent 1\.65px\)/,
  );
  assert.match(
    cssSource,
    /\.works-detail-stage--coding\s*\{[\s\S]*radial-gradient\(circle at 88% 74%,\s*rgba\(199,\s*220,\s*255,\s*0\.55\)\s*0 0\.9px,\s*transparent 1\.5px\)/,
  );
  assert.match(
    cssSource,
    /\.works-detail-stage--coding\s*\{[\s\S]*radial-gradient\(circle at 44% 12%,\s*rgba\(226,\s*236,\s*255,\s*0\.7\)\s*0 0\.95px,\s*transparent 1\.55px\)/,
  );
  assert.match(
    cssSource,
    /\.works-detail-stage--coding\s*\{[\s\S]*radial-gradient\(circle at 12% 78%,\s*rgba\(203,\s*221,\s*255,\s*0\.6\)\s*0 0\.9px,\s*transparent 1\.5px\)/,
  );
  assert.match(
    cssSource,
    /\.works-detail-stage--coding\s*\{[\s\S]*radial-gradient\(circle at 67% 9%,\s*rgba\(237,\s*244,\s*255,\s*0\.74\)\s*0 0\.9px,\s*transparent 1\.45px\)/,
  );
  assert.match(
    cssSource,
    /\.works-detail-stage--coding\s*\{[\s\S]*radial-gradient\(circle at 24% 84%,\s*rgba\(226,\s*238,\s*255,\s*0\.58\)\s*0 0\.85px,\s*transparent 1\.4px\)/,
  );
  assert.match(
    cssSource,
    /\.works-detail-stage__overlay--coding\s*\{[\s\S]*rgba\(5,\s*10,\s*22,\s*0\.3\)[\s\S]*rgba\(52,\s*78,\s*128,\s*0\.26\)[\s\S]*rgba\(3,\s*8,\s*20,\s*0\.58\)/,
  );
  assert.match(
    cssSource,
    /\.works-detail-coding__intro-title\s*\{[\s\S]*color:\s*#eef4ff;/,
  );
  assert.match(
    cssSource,
    /\.works-detail-coding__intro-body[\s\S]*color:\s*rgba\(210,\s*222,\s*245,\s*0\.78\);/,
  );
  assert.match(
    cssSource,
    /\.works-detail-coding__project-card\s*\{[\s\S]*border:\s*1px solid rgba\(171,\s*194,\s*238,\s*0\.16\);[\s\S]*background:\s*linear-gradient\(180deg,\s*rgba\(9,\s*18,\s*35,\s*0\.88\)\s*0%,\s*rgba\(6,\s*12,\s*24,\s*0\.92\)\s*100%\);[\s\S]*box-shadow:\s*0 18px 44px rgba\(0,\s*0,\s*0,\s*0\.28\),\s*inset 0 1px 0 rgba\(198,\s*216,\s*255,\s*0\.08\);/,
  );
  assert.match(
    cssSource,
    /\.works-detail-coding__project-card:hover,\s*\.works-detail-coding__project-card:focus-visible\s*\{[\s\S]*border-color:\s*rgba\(214,\s*229,\s*255,\s*0\.34\);[\s\S]*box-shadow:\s*0 26px 54px rgba\(0,\s*0,\s*0,\s*0\.34\),\s*0 0 26px rgba\(114,\s*149,\s*221,\s*0\.12\);/,
  );
  assert.match(
    cssSource,
    /\.works-detail-coding__project-tag\s*\{[\s\S]*background:\s*rgba\(151,\s*178,\s*227,\s*0\.14\);[\s\S]*color:\s*rgba\(224,\s*234,\s*250,\s*0\.86\);/,
  );
});

test('locks the gallery cards, corridor, and background grid to the same 45 degree diagonal system', () => {
  const cssSource = readFileSync(new URL('../index.css', import.meta.url), 'utf8');
  const componentSource = readFileSync(new URL('./WorksDetailSection.tsx', import.meta.url), 'utf8');

  assert.match(
    cssSource,
    /\.works-detail-stage__grid\s*\{[\s\S]*x1='0' y1='260' x2='260' y2='0'[\s\S]*x1='0' y1='0' x2='260' y2='260'/,
  );
  assert.match(
    cssSource,
    /\.works-detail-track__corridor--band\s*\{[\s\S]*rotate\(-45deg\)/,
  );
  assert.match(
    cssSource,
    /\.works-detail-track__corridor--top,\s*\.works-detail-track__corridor--bottom\s*\{[\s\S]*rotate\(-45deg\)/,
  );
  assert.match(
    cssSource,
    /\.works-detail-track__corridor\s*\{[\s\S]*top:\s*var\(--works-detail-corridor-center-y, 50%\);/,
  );
  assert.match(
    cssSource,
    /\.works-detail-track__corridor--top\s*\{[\s\S]*top:\s*calc\(var\(--works-detail-corridor-center-y, 50%\) - var\(--works-detail-corridor-rail-offset\)\);/,
  );
  assert.match(
    cssSource,
    /\.works-detail-track__corridor--bottom\s*\{[\s\S]*top:\s*calc\(var\(--works-detail-corridor-center-y, 50%\) \+ var\(--works-detail-corridor-rail-offset\)\);/,
  );
  assert.match(
    cssSource,
    /\.works-detail-stage__projects\s*\{[\s\S]*transform:\s*translate3d\(var\(--works-detail-projects-offset-x,\s*[^)]+\),\s*var\(--works-detail-projects-offset-y,\s*[^)]+\),\s*0\);/,
  );
  assert.match(
    cssSource,
    /\.works-detail-track__item\s*\{[\s\S]*translate3d\(var\(--works-detail-slot-x\), var\(--works-detail-slot-y\), 0\)\s*rotate\(45deg\)\s*scale\(var\(--works-detail-slot-scale\)\)/,
  );
  assert.match(
    componentSource,
    /slots:\s*\[\s*\{[\s\S]*x:\s*'-37\.5rem'[\s\S]*y:\s*'33\.7rem'[\s\S]*scale:\s*1\.21/,
  );
  assert.match(
    componentSource,
    /x:\s*'-26\.5rem'[\s\S]*y:\s*'22\.7rem'[\s\S]*scale:\s*1\.21/,
  );
  assert.match(
    componentSource,
    /x:\s*'-15\.5rem'[\s\S]*y:\s*'11\.7rem'[\s\S]*scale:\s*1\.21/,
  );
  assert.match(
    componentSource,
    /x:\s*'-4\.5rem'[\s\S]*y:\s*'0\.7rem'[\s\S]*scale:\s*1\.21/,
  );
  assert.match(
    componentSource,
    /x:\s*'6\.5rem'[\s\S]*y:\s*'-10\.3rem'[\s\S]*scale:\s*1\.21/,
  );
  assert.match(
    componentSource,
    /'--works-detail-corridor-width':\s*'88rem'/,
  );
  assert.doesNotMatch(
    componentSource,
    /'--works-detail-corridor-width':\s*'min\(88rem,\s*170vw\)'/,
  );
  assert.doesNotMatch(
    componentSource,
    /const diagonalOffset = \(activeProjectIndex - WORKS_DETAIL_DEFAULT_ACTIVE_INDEX\) \* 18;/,
  );
  assert.match(
    componentSource,
    /const projectIndex = activeProjectIndex \+ slotIndex - WORKS_DETAIL_ACTIVE_SLOT_INDEX;/,
  );
  assert.doesNotMatch(componentSource, /const startIndex = Math\.min\(/);
  assert.doesNotMatch(
    componentSource,
    /gsap\.to\(trackRef\.current,\s*\{[\s\S]*x:\s*-diagonalOffset,[\s\S]*y:\s*diagonalOffset,[\s\S]*\}\);/,
  );
});
