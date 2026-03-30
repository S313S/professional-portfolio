export function shouldHideNavbarForWorksLobby(
  sectionTop: number,
  sectionBottom: number,
  viewportHeight: number,
) {
  return sectionTop < viewportHeight && sectionBottom > 0;
}
