/**
 * HUD Controller, 3D Label Projection & Audio Synthesizer
 * "Inside the Human Brain" - Interactive 3D Educational Project
 */

class HUDController {
  constructor() {
    this.audioEnabled = false;
    this.audioCtx = null;
    this.ambientOsc1 = null;
    this.ambientOsc2 = null;
    this.ambientGain = null;

    this.activeSection = null;
    this.activeModalStructure = null;

    // Cache DOM Elements
    this.hudPanel = document.querySelector('#hud-panel');
    this.sectionTag = document.querySelector('#section-tag');
    this.sectionNum = document.querySelector('#section-num');
    this.sectionTitle = document.querySelector('#section-title');
    this.sectionSubtitle = document.querySelector('#section-subtitle');
    this.sectionDesc = document.querySelector('#section-desc');
    this.sectionBullets = document.querySelector('#section-bullets');
    this.exploreAgainBtn = document.querySelector('#explore-again-btn');

    this.progressBar = document.querySelector('#progress-bar-fill');
    this.progressStepsContainer = document.querySelector('#progress-steps');

    this.modalBackdrop = document.querySelector('#anatomy-modal');
    this.modalTitle = document.querySelector('#modal-title');
    this.modalLatin = document.querySelector('#modal-latin');
    this.modalCategory = document.querySelector('#modal-category');
    this.modalRole = document.querySelector('#modal-role');
    this.modalDesc = document.querySelector('#modal-desc');
    this.modalKeyParts = document.querySelector('#modal-key-parts');
    this.modalTrivia = document.querySelector('#modal-trivia');
    this.modalColorBadge = document.querySelector('#modal-color-badge');

    this.audioToggleBtn = document.querySelector('#audio-toggle-btn');
    this.audioIcon = document.querySelector('#audio-icon');

    this.floatingLabel = document.querySelector('#floating-pin');
    this.floatingLabelText = document.querySelector('#floating-pin-text');
    this.floatingLabelLine = document.querySelector('#floating-pin-line');

    this.init();
  }

  init() {
    this.buildProgressSteps();
    this.setupEventListeners();
    this.setupAudio();
    this.startLabelProjectionLoop();
  }

  /**
   * Generates interactive vertical step navigation pills
   */
  buildProgressSteps() {
    if (!this.progressStepsContainer || !window.BRAIN_SECTIONS) return;

    this.progressStepsContainer.innerHTML = '';
    window.BRAIN_SECTIONS.forEach((sec, idx) => {
      const step = document.createElement('div');
      step.className = `progress-step-item ${idx === 0 ? 'active' : ''}`;
      step.dataset.index = idx;
      step.setAttribute('title', `${sec.num}. ${sec.title}`);

      step.innerHTML = `
        <span class="step-dot" style="--accent-color: ${sec.color}"></span>
        <span class="step-label">${sec.title}</span>
      `;

      step.addEventListener('click', () => {
        if (window.scrollEngine) {
          window.scrollEngine.scrollToSection(idx);
          this.playChime(440 + idx * 40);
        }
      });

      this.progressStepsContainer.appendChild(step);
    });
  }

  setupEventListeners() {
    // "Explore Again" button in section 10
    if (this.exploreAgainBtn) {
      this.exploreAgainBtn.addEventListener('click', () => {
        if (window.scrollEngine) {
          window.scrollEngine.scrollToSection(0);
          this.playChime(660);
        }
      });
    }

    // Modal close button
    const modalCloseBtn = document.querySelector('#modal-close-btn');
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', () => this.closeInspector());
    }
    if (this.modalBackdrop) {
      this.modalBackdrop.addEventListener('click', (e) => {
        if (e.target === this.modalBackdrop) this.closeInspector();
      });
    }

    // Audio toggle
    if (this.audioToggleBtn) {
      this.audioToggleBtn.addEventListener('click', () => this.toggleAudio());
    }

    // Model settings modal toggle
    const modelSettingsBtn = document.querySelector('#model-settings-btn');
    const modelModal = document.querySelector('#model-modal');
    const modelModalClose = document.querySelector('#model-modal-close');
    const fileInput = document.querySelector('#glb-file-input');

    if (modelSettingsBtn && modelModal) {
      modelSettingsBtn.addEventListener('click', () => {
        modelModal.classList.add('visible');
      });
    }
    if (modelModalClose && modelModal) {
      modelModalClose.addEventListener('click', () => {
        modelModal.classList.remove('visible');
      });
    }

    // File input for custom GLB/GLTF
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && window.brainVisualizer) {
          const url = URL.createObjectURL(file);
          window.brainVisualizer.loadGLBModel(url);
          if (modelModal) modelModal.classList.remove('visible');
        }
      });
    }

    // Quick Structure Selector Drawer button
    const structureListBtn = document.querySelector('#structure-list-btn');
    const structureDrawer = document.querySelector('#structure-drawer');
    const structureDrawerClose = document.querySelector('#structure-drawer-close');

    if (structureListBtn && structureDrawer) {
      structureListBtn.addEventListener('click', () => {
        structureDrawer.classList.toggle('open');
      });
    }
    if (structureDrawerClose && structureDrawer) {
      structureDrawerClose.addEventListener('click', () => {
        structureDrawer.classList.remove('open');
      });
    }

    // Populate structure drawer links
    const drawerList = document.querySelector('#structure-drawer-items');
    if (drawerList && window.ANATOMY_DETAILS) {
      drawerList.innerHTML = '';
      for (const key in window.ANATOMY_DETAILS) {
        const item = window.ANATOMY_DETAILS[key];
        const row = document.createElement('div');
        row.className = 'drawer-item';
        row.innerHTML = `
          <div class="drawer-item-dot" style="background: ${item.color}; box-shadow: 0 0 10px ${item.color};"></div>
          <div class="drawer-item-info">
            <div class="drawer-item-name">${item.name}</div>
            <div class="drawer-item-cat">${item.category}</div>
          </div>
        `;
        row.addEventListener('click', () => {
          this.openInspector(key);
          if (structureDrawer) structureDrawer.classList.remove('open');
        });
        drawerList.appendChild(row);
      }
    }

    // Keyboard shortcuts (Space / Down to advance, Up to go back, M for audio)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'm' || e.key === 'M') {
        this.toggleAudio();
      } else if (e.key === 'Escape') {
        this.closeInspector();
        if (modelModal) modelModal.classList.remove('visible');
        if (structureDrawer) structureDrawer.classList.remove('open');
      }
    });
  }

  /**
   * Updates Section HUD texts, styles, and progress indicators
   */
  updateSection(section) {
    this.activeSection = section;

    // Trigger subtle glitch / fade re-entry animation
    if (this.hudPanel) {
      this.hudPanel.classList.remove('active-in');
      void this.hudPanel.offsetWidth; // Trigger reflow
      this.hudPanel.classList.add('active-in');
      this.hudPanel.style.setProperty('--current-accent', section.color);
    }

    if (this.sectionTag) this.sectionTag.textContent = section.tag;
    if (this.sectionNum) this.sectionNum.textContent = section.num;
    if (this.sectionTitle) this.sectionTitle.textContent = section.title;
    if (this.sectionSubtitle) this.sectionSubtitle.textContent = section.subtitle;
    if (this.sectionDesc) this.sectionDesc.textContent = section.description;

    // Populate bullet points
    if (this.sectionBullets) {
      this.sectionBullets.innerHTML = '';
      (section.bulletPoints || []).forEach(bp => {
        const li = document.createElement('li');
        li.textContent = bp;
        this.sectionBullets.appendChild(li);
      });
    }

    // Toggle "Explore Again" button visibility
    if (this.exploreAgainBtn) {
      if (section.id === 'final-view') {
        this.exploreAgainBtn.classList.add('visible');
      } else {
        this.exploreAgainBtn.classList.remove('visible');
      }
    }

    // Update Progress Bar
    const sectionIndex = parseInt(section.num, 10) - 1;
    const total = window.BRAIN_SECTIONS.length;
    const percent = ((sectionIndex) / (total - 1)) * 100;
    if (this.progressBar) {
      this.progressBar.style.height = `${percent}%`;
    }

    // Update Step items
    const stepItems = document.querySelectorAll('.progress-step-item');
    stepItems.forEach((item, idx) => {
      if (idx === sectionIndex) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Sound chime on section shift
    this.playChime(320 + sectionIndex * 35);
  }

  /**
   * Opens detailed anatomical inspection modal
   */
  openInspector(structureId) {
    const data = window.ANATOMY_DETAILS ? window.ANATOMY_DETAILS[structureId] : null;
    if (!data) return;

    this.activeModalStructure = data;

    if (this.modalTitle) this.modalTitle.textContent = data.name;
    if (this.modalLatin) this.modalLatin.textContent = data.latin;
    if (this.modalCategory) this.modalCategory.textContent = data.category;
    if (this.modalRole) this.modalRole.textContent = data.role;
    if (this.modalDesc) this.modalDesc.textContent = data.description;
    if (this.modalTrivia) this.modalTrivia.textContent = data.trivia;

    if (this.modalColorBadge) {
      this.modalColorBadge.style.backgroundColor = data.color;
      this.modalColorBadge.style.boxShadow = `0 0 16px ${data.color}`;
    }

    if (this.modalKeyParts) {
      this.modalKeyParts.innerHTML = '';
      (data.keyStructures || []).forEach(part => {
        const item = document.createElement('div');
        item.className = 'key-part-chip';
        item.textContent = part;
        this.modalKeyParts.appendChild(item);
      });
    }

    if (this.modalBackdrop) {
      this.modalBackdrop.classList.add('visible');
    }

    this.playChime(580);
  }

  closeInspector() {
    if (this.modalBackdrop) {
      this.modalBackdrop.classList.remove('visible');
    }
  }

  /**
   * 3D to 2D screen coordinate projection for the floating label pin
   */
  startLabelProjectionLoop() {
    const scene = document.querySelector('a-scene');

    const updatePin = () => {
      if (scene && scene.camera && this.activeSection && this.floatingLabel) {
        const structId = this.activeSection.highlightStructure;

        if (structId && structId !== 'all' && window.ANATOMY_DETAILS && window.ANATOMY_DETAILS[structId]) {
          const info = window.ANATOMY_DETAILS[structId];
          const anchor = info.anchor;

          // Convert 3D local anchor coordinate to screen vector
          const v = new THREE.Vector3(anchor.x, anchor.y, anchor.z);

          // Get brain root rotation/position
          const brainEl = document.querySelector('#brain-model');
          if (brainEl && brainEl.object3D) {
            v.applyMatrix4(brainEl.object3D.matrixWorld);
          }

          // Project to 2D normalized device coordinates [-1, 1]
          v.project(scene.camera);

          // Check if in front of camera
          if (v.z < 1.0) {
            const screenX = (v.x * 0.5 + 0.5) * window.innerWidth;
            const screenY = (-(v.y * 0.5) + 0.5) * window.innerHeight;

            this.floatingLabel.style.display = 'flex';
            this.floatingLabel.style.transform = `translate(${screenX}px, ${screenY}px)`;
            if (this.floatingLabelText) {
              this.floatingLabelText.textContent = info.name;
              this.floatingLabelText.style.borderColor = info.color;
              this.floatingLabelText.style.color = info.color;
            }
          } else {
            this.floatingLabel.style.display = 'none';
          }
        } else {
          this.floatingLabel.style.display = 'none';
        }
      }
      requestAnimationFrame(updatePin);
    };

    requestAnimationFrame(updatePin);
  }

  /**
   * Procedural Audio Synthesizer (Binaural Neural Hum + High Harmonic Chimes)
   */
  setupAudio() {
    // Lazy initialize on first user interaction
    const initCtx = () => {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.audioCtx = new AudioContext();
        }
      }
    };
    window.addEventListener('click', initCtx, { once: true });
    window.addEventListener('touchstart', initCtx, { once: true });
  }

  toggleAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.audioCtx = new AudioContext();
    }

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    this.audioEnabled = !this.audioEnabled;

    if (this.audioToggleBtn) {
      if (this.audioEnabled) {
        this.audioToggleBtn.classList.add('active');
        this.audioToggleBtn.setAttribute('title', 'Mute Neural Audio');
        this.startAmbientHum();
        this.showToast('Audio Synth: Active (55Hz Neural Drone)');
      } else {
        this.audioToggleBtn.classList.remove('active');
        this.audioToggleBtn.setAttribute('title', 'Enable Neural Audio');
        this.stopAmbientHum();
        this.showToast('Audio Synth: Muted');
      }
    }
  }

  startAmbientHum() {
    if (!this.audioCtx || !this.audioEnabled) return;

    try {
      this.stopAmbientHum();

      this.ambientGain = this.audioCtx.createGain();
      this.ambientGain.gain.setValueAtTime(0.045, this.audioCtx.currentTime);

      // Low binaural frequencies
      this.ambientOsc1 = this.audioCtx.createOscillator();
      this.ambientOsc1.type = 'sine';
      this.ambientOsc1.frequency.setValueAtTime(55, this.audioCtx.currentTime); // A1 note

      this.ambientOsc2 = this.audioCtx.createOscillator();
      this.ambientOsc2.type = 'triangle';
      this.ambientOsc2.frequency.setValueAtTime(110.5, this.audioCtx.currentTime); // Slight binaural detune

      // Lowpass filter for smooth sci-fi feel
      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, this.audioCtx.currentTime);

      this.ambientOsc1.connect(filter);
      this.ambientOsc2.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.audioCtx.destination);

      this.ambientOsc1.start();
      this.ambientOsc2.start();
    } catch (err) {
      console.warn('Audio start error:', err);
    }
  }

  stopAmbientHum() {
    try {
      if (this.ambientOsc1) { this.ambientOsc1.stop(); this.ambientOsc1.disconnect(); this.ambientOsc1 = null; }
      if (this.ambientOsc2) { this.ambientOsc2.stop(); this.ambientOsc2.disconnect(); this.ambientOsc2 = null; }
      if (this.ambientGain) { this.ambientGain.disconnect(); this.ambientGain = null; }
    } catch (err) {}
  }

  playChime(frequency) {
    if (!this.audioEnabled || !this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency || 520, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime((frequency || 520) * 1.5, this.audioCtx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.06, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.45);
    } catch (err) {}
  }

  showToast(message) {
    const toast = document.querySelector('#toast-notification');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }
}

// Global export
window.HUDController = HUDController;
