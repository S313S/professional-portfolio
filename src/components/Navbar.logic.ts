export function shouldHideNavbarForWorksLobby(sectionTop: number, sectionBottom: number) {
  return sectionTop < window.innerHeight && sectionBottom > 0;
}
