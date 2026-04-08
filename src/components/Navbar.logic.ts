export function shouldHideNavbarForImmersiveSection(
  sectionTop: number,
  sectionBottom: number,
  viewportHeight: number,
) {
  return sectionTop < viewportHeight && sectionBottom > 0;
}

export function shouldHideNavbarForSectionRects(
  sectionRects: Array<{ top: number; bottom: number }>,
  viewportHeight: number,
) {
  return sectionRects.some((sectionRect) =>
    shouldHideNavbarForImmersiveSection(
      sectionRect.top,
      sectionRect.bottom,
      viewportHeight,
    ),
  );
}

type ShouldHideNavbarArgs = {
  latestScrollY: number;
  previousScrollY: number;
  isOpen: boolean;
  immersiveSectionRects: Array<{ top: number; bottom: number }>;
  viewportHeight: number;
};

export function shouldHideNavbar({
  latestScrollY,
  previousScrollY,
  isOpen,
  immersiveSectionRects,
  viewportHeight,
}: ShouldHideNavbarArgs) {
  if (shouldHideNavbarForSectionRects(immersiveSectionRects, viewportHeight)) {
    return true;
  }

  return latestScrollY > previousScrollY && latestScrollY > 150 && !isOpen;
}
