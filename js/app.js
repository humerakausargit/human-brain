/**
 * Main Application Orchestrator
 * "Inside the Human Brain" - Interactive 3D Educational Project
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log("Initializing 'Inside the Human Brain' Interactive Experience...");

  // Instantiate HUD Controller
  window.hudController = new HUDController();

  // Instantiate Scroll Engine
  window.scrollEngine = new ScrollEngine();

  // Set initial section HUD
  if (window.BRAIN_SECTIONS && window.BRAIN_SECTIONS[0]) {
    window.hudController.updateSection(window.BRAIN_SECTIONS[0]);
  }

  // Handle intro scroll hint button
  const scrollIndicator = document.querySelector('#scroll-hint');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      window.scrollEngine.scrollToSection(1);
    });
  }

  // Hide loader once scene is ready
  const sceneEl = document.querySelector('a-scene');
  const loaderEl = document.querySelector('#loading-screen');

  if (sceneEl) {
    if (sceneEl.hasLoaded) {
      dismissLoader(loaderEl);
    } else {
      sceneEl.addEventListener('loaded', () => dismissLoader(loaderEl));
    }
  }

  function dismissLoader(loader) {
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => {
        loader.style.display = 'none';
      }, 700);
    }
  }
});
