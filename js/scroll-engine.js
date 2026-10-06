/**
 * Scroll Engine & 3D Camera Choreography
 * "Inside the Human Brain" - Interactive 3D Educational Project
 */

class ScrollEngine {
  constructor() {
    this.sections = window.BRAIN_SECTIONS || [];
    this.totalSections = this.sections.length;
    this.currentSectionIndex = 0;
    this.activeSection = this.sections[0];

    // Scroll progress values
    this.rawProgress = 0;
    this.smoothProgress = 0;
    this.isScrolling = false;
    this.scrollTimeout = null;

    // Camera current & target vectors
    this.camPos = new THREE.Vector3(0, 1.2, 6.0);
    this.targetCamPos = new THREE.Vector3(0, 1.2, 6.0);
    this.camLook = new THREE.Vector3(0, 0.1, 0);
    this.targetCamLook = new THREE.Vector3(0, 0.1, 0);

    // Brain manual drag orbit offset
    this.dragOffset = { x: 0, y: 0 };
    this.targetDragOffset = { x: 0, y: 0 };
    this.isDragging = false;
    this.lastPointerPos = { x: 0, y: 0 };
    this.idleTimer = 0;

    // References to A-Frame scene elements
    this.cameraEl = null;
    this.brainEntityEl = null;

    this.init();
  }

  init() {
    // Wait for A-Frame scene to load
    const scene = document.querySelector('a-scene');
    if (scene) {
      if (scene.hasLoaded) {
        this.setupSceneRefs();
      } else {
        scene.addEventListener('loaded', () => this.setupSceneRefs());
      }
    }

    this.setupScrollListeners();
    this.setupDragInteraction();
    this.startAnimationLoop();
  }

  setupSceneRefs() {
    this.cameraEl = document.querySelector('#main-camera');
    this.brainEntityEl = document.querySelector('#brain-model');

    if (this.cameraEl && this.cameraEl.object3D) {
      const pos = this.sections[0].camera.position;
      const look = this.sections[0].camera.target;
      this.camPos.set(pos.x, pos.y, pos.z);
      this.targetCamPos.set(pos.x, pos.y, pos.z);
      this.camLook.set(look.x, look.y, look.z);
      this.targetCamLook.set(look.x, look.y, look.z);
      this.cameraEl.object3D.position.copy(this.camPos);
      this.cameraEl.object3D.lookAt(this.camLook);
    }
  }

  setupScrollListeners() {
    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;

      this.rawProgress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
      this.isScrolling = true;

      // Reset drag offset when user actively scrolls
      this.targetDragOffset.x *= 0.85;
      this.targetDragOffset.y *= 0.85;

      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = setTimeout(() => {
        this.isScrolling = false;
      }, 150);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // Initial call
    onScroll();
  }

  setupDragInteraction() {
    const onPointerDown = (e) => {
      // Don't drag if clicking buttons, cards, drawer, or modals
      if (e.target.closest('.hud-panel, .modal-card, .modal-backdrop, button, input, .progress-step-item, .drawer-item, #structure-drawer, #scroll-hint')) {
        return;
      }
      this.isDragging = true;
      this.lastPointerPos.x = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0].clientX) || 0;
      this.lastPointerPos.y = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0].clientY) || 0;
    };

    const onPointerMove = (e) => {
      if (!this.isDragging || this.isScrolling) return;

      const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0].clientY) || 0;

      const deltaX = clientX - this.lastPointerPos.x;
      const deltaY = clientY - this.lastPointerPos.y;

      // On mobile touch, if user is primarily scrolling vertically, don't drag rotate
      if (e.touches && Math.abs(deltaY) > Math.abs(deltaX) * 1.4) {
        return;
      }

      this.lastPointerPos.x = clientX;
      this.lastPointerPos.y = clientY;

      // Add gentle rotation offset
      this.targetDragOffset.y += deltaX * 0.005;
      this.targetDragOffset.x += deltaY * 0.005;

      // Clamp vertical tilt
      this.targetDragOffset.x = Math.max(-0.6, Math.min(0.6, this.targetDragOffset.x));
    };

    const onPointerUp = () => {
      this.isDragging = false;
    };

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    window.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);
  }

  /**
   * Smooth Hermite interpolation (smoothstep)
   */
  smoothStep(t) {
    return t * t * (3 - 2 * t);
  }

  /**
   * Scrolls smoothly to a target section by index (0 - 9)
   */
  scrollToSection(index) {
    if (index < 0 || index >= this.totalSections) return;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const targetScroll = (index / (this.totalSections - 1)) * maxScroll;

    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  }

  /**
   * Main continuous animation loop (interpolates camera and updates scene)
   */
  startAnimationLoop() {
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min(0.1, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      // Smooth progress lerp (dampening)
      this.smoothProgress += (this.rawProgress - this.smoothProgress) * 0.07;

      // Smooth manual drag rotation lerp
      this.dragOffset.x += (this.targetDragOffset.x - this.dragOffset.x) * 0.08;
      this.dragOffset.y += (this.targetDragOffset.y - this.dragOffset.y) * 0.08;

      // Compute section interpolation
      const scaledProgress = this.smoothProgress * (this.totalSections - 1);
      const sectionIdx = Math.floor(scaledProgress);
      const nextIdx = Math.min(this.totalSections - 1, sectionIdx + 1);
      const localProgress = scaledProgress - sectionIdx;
      const smoothLocalT = this.smoothStep(localProgress);

      const secA = this.sections[sectionIdx];
      const secB = this.sections[nextIdx];

      if (secA && secB) {
        // Interpolate camera position
        this.targetCamPos.x = secA.camera.position.x + (secB.camera.position.x - secA.camera.position.x) * smoothLocalT;
        this.targetCamPos.y = secA.camera.position.y + (secB.camera.position.y - secA.camera.position.y) * smoothLocalT;
        this.targetCamPos.z = secA.camera.position.z + (secB.camera.position.z - secA.camera.position.z) * smoothLocalT;

        // Interpolate camera lookAt target
        this.targetCamLook.x = secA.camera.target.x + (secB.camera.target.x - secA.camera.target.x) * smoothLocalT;
        this.targetCamLook.y = secA.camera.target.y + (secB.camera.target.y - secA.camera.target.y) * smoothLocalT;
        this.targetCamLook.z = secA.camera.target.z + (secB.camera.target.z - secA.camera.target.z) * smoothLocalT;

        // Update active section state based on closest threshold
        const newActiveIdx = Math.round(scaledProgress);
        if (newActiveIdx !== this.currentSectionIndex) {
          this.currentSectionIndex = newActiveIdx;
          this.onSectionChange(this.sections[newActiveIdx]);
        }
      }

      // Smoothly move camera
      this.camPos.lerp(this.targetCamPos, 0.09);
      this.camLook.lerp(this.targetCamLook, 0.09);

      if (this.cameraEl && this.cameraEl.object3D) {
        this.cameraEl.object3D.position.copy(this.camPos);
        this.cameraEl.object3D.lookAt(this.camLook);
      }

      // Update brain model rotation
      if (this.brainEntityEl && this.brainEntityEl.object3D) {
        const brain3D = this.brainEntityEl.object3D;

        // Idle slow rotation when not dragging & not scrolling
        if (!this.isDragging && !this.isScrolling) {
          this.idleTimer += dt;
          if (this.sections[this.currentSectionIndex].autoRotate) {
            brain3D.rotation.y += dt * 0.18;
          }
        }

        // Apply drag offset
        brain3D.rotation.x = (this.sections[this.currentSectionIndex].brainRotation.x || 0) + this.dragOffset.x;
        if (!this.sections[this.currentSectionIndex].autoRotate) {
          brain3D.rotation.y = (this.sections[this.currentSectionIndex].brainRotation.y || 0) + this.dragOffset.y;
        }
      }

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  /**
   * Called when scrolling crosses into a new section
   */
  onSectionChange(section) {
    this.activeSection = section;

    // Update brain visualizer highlight & cortex transparency
    if (window.brainVisualizer) {
      window.brainVisualizer.setHighlight(section.highlightStructure, section.color);
      window.brainVisualizer.setCortexState(section.cortexOpacity, section.cortexWireframe);
    }

    // Update HUD and progress bar
    if (window.hudController) {
      window.hudController.updateSection(section);
    }
  }
}

// Global export
window.ScrollEngine = ScrollEngine;
