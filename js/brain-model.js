/**
 * Brain 3D Model & Procedural Anatomy Generator for A-Frame
 * "Inside the Human Brain" - Interactive 3D Educational Project
 */

AFRAME.registerComponent('brain-visualizer', {
  schema: {
    activeSection: { type: 'string', default: 'intro' },
    highlightStructure: { type: 'string', default: '' },
    cortexOpacity: { type: 'number', default: 0.96 },
    cortexWireframe: { type: 'boolean', default: false },
    autoRotate: { type: 'boolean', default: true },
    rotationSpeed: { type: 'number', default: 0.25 }
  },

  init: function () {
    this.brainGroup = new THREE.Group();
    this.brainGroup.name = "brain_root";
    this.el.setObject3D('brain', this.brainGroup);

    this.structures = {};
    this.structureMaterials = {};
    this.interactiveMeshes = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Pulse animation state
    this.pulseTime = 0;
    this.activeHighlight = null;
    this.targetCortexOpacity = 0.96;
    this.currentCortexOpacity = 0.96;

    // Build the procedural anatomical structures
    this.buildBrainModel();
    this.buildSynapticParticleNetwork();
    this.setupInteractivity();

    // Register globally for HUD and scroll engine access
    window.brainVisualizer = this;
  },

  /**
   * Constructs the full 3D Anatomical Brain:
   * 1. Cerebrum (Left & Right Hemispheres with realistic gyri/sulci convolutions)
   * 2. Corpus Callosum (C-shaped commissural nerve tract)
   * 3. Thalamus (Paired sensory relay nuclei)
   * 4. Hypothalamus (Homeostatic center & infundibulum)
   * 5. Hippocampus (Bilateral seahorse memory structures)
   * 6. Amygdala (Bilateral almond emotion nuclei)
   * 7. Brainstem (Midbrain, bulbous Pons, Medulla Oblongata)
   * 8. Cerebellum (Bilateral folia lobes & vermis)
   */
  buildBrainModel: function () {
    // ----------------------------------------------------
    // 1. CEREBRUM (Left & Right Cerebral Hemispheres)
    // ----------------------------------------------------
    const cerebrumGroup = new THREE.Group();
    cerebrumGroup.name = "cerebrum";
    this.structures['cerebrum'] = cerebrumGroup;

    // Procedural Gyri/Sulci Cortical Convolutions
    const hemisphereGeo = new THREE.SphereGeometry(1.4, 64, 48);
    this.applyCorticalConvolutions(hemisphereGeo);

    // Realistic translucent neural cortex material
    const cortexMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x3a86ff),
      emissive: new THREE.Color(0x071e3d),
      emissiveIntensity: 0.35,
      roughness: 0.32,
      metalness: 0.1,
      transmission: 0.0,
      transparent: true,
      opacity: 0.96,
      depthWrite: true,
      side: THREE.DoubleSide
    });
    this.cortexMaterial = cortexMaterial;
    this.structureMaterials['cerebrum'] = cortexMaterial;

    // Wireframe holographic overlay for x-ray transitions
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x00f5d4),
      wireframe: true,
      transparent: true,
      opacity: 0.0
    });
    this.wireframeMaterial = wireframeMaterial;

    // Left Hemisphere
    const leftHemisphere = new THREE.Mesh(hemisphereGeo, cortexMaterial);
    leftHemisphere.position.set(-0.48, 0.45, 0);
    leftHemisphere.scale.set(0.78, 0.95, 1.15);
    leftHemisphere.userData = { structureId: 'cerebrum', name: 'Left Cerebral Hemisphere' };
    cerebrumGroup.add(leftHemisphere);
    this.interactiveMeshes.push(leftHemisphere);

    // Left Holographic Shell
    const leftShell = new THREE.Mesh(hemisphereGeo.clone(), wireframeMaterial);
    leftShell.position.copy(leftHemisphere.position);
    leftShell.scale.set(0.79, 0.96, 1.16);
    cerebrumGroup.add(leftShell);

    // Right Hemisphere
    const rightHemisphere = new THREE.Mesh(hemisphereGeo.clone(), cortexMaterial);
    rightHemisphere.position.set(0.48, 0.45, 0);
    rightHemisphere.scale.set(0.78, 0.95, 1.15);
    rightHemisphere.userData = { structureId: 'cerebrum', name: 'Right Cerebral Hemisphere' };
    cerebrumGroup.add(rightHemisphere);
    this.interactiveMeshes.push(rightHemisphere);

    // Right Holographic Shell
    const rightShell = new THREE.Mesh(hemisphereGeo.clone(), wireframeMaterial);
    rightShell.position.copy(rightHemisphere.position);
    rightShell.scale.set(0.79, 0.96, 1.16);
    cerebrumGroup.add(rightShell);

    this.brainGroup.add(cerebrumGroup);

    // ----------------------------------------------------
    // 2. CORPUS CALLOSUM (C-Shaped Commissural Nerve Tract)
    // ----------------------------------------------------
    const callosumGroup = new THREE.Group();
    callosumGroup.name = "corpus_callosum";
    this.structures['corpus_callosum'] = callosumGroup;

    // Arched commissure spline path
    const callosumPoints = [
      new THREE.Vector3(0, 0.15, 0.75),   // Rostrum
      new THREE.Vector3(0, 0.52, 0.65),   // Genu curve
      new THREE.Vector3(0, 0.72, 0.25),   // Anterior body
      new THREE.Vector3(0, 0.75, -0.2),   // Superior arch peak
      new THREE.Vector3(0, 0.65, -0.58),  // Posterior body
      new THREE.Vector3(0, 0.42, -0.82),  // Splenium bulb
      new THREE.Vector3(0, 0.28, -0.78)   // Splenium curve
    ];
    const callosumCurve = new THREE.CatmullRomCurve3(callosumPoints);
    const callosumGeo = new THREE.TubeGeometry(callosumCurve, 64, 0.16, 20, false);

    const callosumMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xe056fd),
      emissive: new THREE.Color(0x7b2cbf),
      emissiveIntensity: 0.65,
      roughness: 0.28,
      metalness: 0.15,
      transparent: true,
      opacity: 0.95
    });
    this.structureMaterials['corpus_callosum'] = callosumMat;

    const callosumMesh = new THREE.Mesh(callosumGeo, callosumMat);
    callosumMesh.scale.set(1.5, 1.0, 1.0); // Widen horizontally to represent fiber band
    callosumMesh.userData = { structureId: 'corpus_callosum', name: 'Corpus Callosum' };
    callosumGroup.add(callosumMesh);
    this.interactiveMeshes.push(callosumMesh);

    this.brainGroup.add(callosumGroup);

    // ----------------------------------------------------
    // 3. THALAMUS (Paired Sensory Relay Nuclei)
    // ----------------------------------------------------
    const thalamusGroup = new THREE.Group();
    thalamusGroup.name = "thalamus";
    this.structures['thalamus'] = thalamusGroup;

    const thalamusGeo = new THREE.SphereGeometry(0.36, 32, 24);
    const thalamusMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xffd166),
      emissive: new THREE.Color(0xf59e0b),
      emissiveIntensity: 0.6,
      roughness: 0.25,
      metalness: 0.2,
      transparent: true,
      opacity: 0.95
    });
    this.structureMaterials['thalamus'] = thalamusMat;

    // Left Thalamic Ovoid
    const leftThalamus = new THREE.Mesh(thalamusGeo, thalamusMat);
    leftThalamus.position.set(-0.30, 0.22, -0.05);
    leftThalamus.scale.set(0.72, 0.92, 1.25);
    leftThalamus.rotation.set(0.1, -0.15, -0.2);
    leftThalamus.userData = { structureId: 'thalamus', name: 'Left Thalamus' };
    thalamusGroup.add(leftThalamus);
    this.interactiveMeshes.push(leftThalamus);

    // Right Thalamic Ovoid
    const rightThalamus = new THREE.Mesh(thalamusGeo.clone(), thalamusMat);
    rightThalamus.position.set(0.30, 0.22, -0.05);
    rightThalamus.scale.set(0.72, 0.92, 1.25);
    rightThalamus.rotation.set(0.1, 0.15, 0.2);
    rightThalamus.userData = { structureId: 'thalamus', name: 'Right Thalamus' };
    thalamusGroup.add(rightThalamus);
    this.interactiveMeshes.push(rightThalamus);

    // Interthalamic Adhesion (Massa Intermedia bridge)
    const adhesionGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 16);
    const adhesionMesh = new THREE.Mesh(adhesionGeo, thalamusMat);
    adhesionMesh.rotation.z = Math.PI / 2;
    adhesionMesh.position.set(0, 0.22, -0.05);
    adhesionMesh.userData = { structureId: 'thalamus', name: 'Interthalamic Adhesion' };
    thalamusGroup.add(adhesionMesh);

    this.brainGroup.add(thalamusGroup);

    // ----------------------------------------------------
    // 4. HYPOTHALAMUS (Homeostatic Center & Pituitary Stem)
    // ----------------------------------------------------
    const hypoGroup = new THREE.Group();
    hypoGroup.name = "hypothalamus";
    this.structures['hypothalamus'] = hypoGroup;

    const hypoMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x06d6a0),
      emissive: new THREE.Color(0x059669),
      emissiveIntensity: 0.65,
      roughness: 0.28,
      metalness: 0.15,
      transparent: true,
      opacity: 0.95
    });
    this.structureMaterials['hypothalamus'] = hypoMat;

    // Hypothalamic Nucleus Body
    const hypoGeo = new THREE.ConeGeometry(0.32, 0.45, 24);
    const hypoMesh = new THREE.Mesh(hypoGeo, hypoMat);
    hypoMesh.rotation.x = Math.PI; // Inverted cone tapering ventrally
    hypoMesh.position.set(0, -0.12, 0.22);
    hypoMesh.scale.set(1.1, 0.9, 1.0);
    hypoMesh.userData = { structureId: 'hypothalamus', name: 'Hypothalamus' };
    hypoGroup.add(hypoMesh);
    this.interactiveMeshes.push(hypoMesh);

    // Infundibular Stalk & Pituitary gland bud
    const stalkGeo = new THREE.CylinderGeometry(0.05, 0.09, 0.25, 16);
    const stalkMesh = new THREE.Mesh(stalkGeo, hypoMat);
    stalkMesh.position.set(0, -0.35, 0.28);
    stalkMesh.rotation.x = 0.2;
    hypoGroup.add(stalkMesh);

    const pituitaryGeo = new THREE.SphereGeometry(0.12, 16, 12);
    const pituitaryMesh = new THREE.Mesh(pituitaryGeo, hypoMat);
    pituitaryMesh.position.set(0, -0.48, 0.32);
    pituitaryMesh.userData = { structureId: 'hypothalamus', name: 'Pituitary Gland' };
    hypoGroup.add(pituitaryMesh);
    this.interactiveMeshes.push(pituitaryMesh);

    this.brainGroup.add(hypoGroup);

    // ----------------------------------------------------
    // 5. HIPPOCAMPUS (Bilateral Seahorse Memory Horns)
    // ----------------------------------------------------
    const hippoGroup = new THREE.Group();
    hippoGroup.name = "hippocampus";
    this.structures['hippocampus'] = hippoGroup;

    const hippoMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x8338ec),
      emissive: new THREE.Color(0x6b21a8),
      emissiveIntensity: 0.65,
      roughness: 0.3,
      metalness: 0.15,
      transparent: true,
      opacity: 0.95
    });
    this.structureMaterials['hippocampus'] = hippoMat;

    // Left Hippocampal Horn Spline
    const leftHippoPoints = [
      new THREE.Vector3(-0.62, -0.28, 0.32),  // Pes hippocampus (head)
      new THREE.Vector3(-0.72, -0.22, 0.15),  // Anterior curve
      new THREE.Vector3(-0.74, -0.16, -0.12), // Body arch
      new THREE.Vector3(-0.62, -0.08, -0.35), // Tail tapering medially
      new THREE.Vector3(-0.35, 0.06, -0.48)   // Fornix crus extension
    ];
    const leftHippoCurve = new THREE.CatmullRomCurve3(leftHippoPoints);
    const leftHippoGeo = new THREE.TubeGeometry(leftHippoCurve, 48, 0.11, 16, false);
    const leftHippoMesh = new THREE.Mesh(leftHippoGeo, hippoMat);
    leftHippoMesh.userData = { structureId: 'hippocampus', name: 'Left Hippocampus' };
    hippoGroup.add(leftHippoMesh);
    this.interactiveMeshes.push(leftHippoMesh);

    // Right Hippocampal Horn Spline
    const rightHippoPoints = [
      new THREE.Vector3(0.62, -0.28, 0.32),
      new THREE.Vector3(0.72, -0.22, 0.15),
      new THREE.Vector3(0.74, -0.16, -0.12),
      new THREE.Vector3(0.62, -0.08, -0.35),
      new THREE.Vector3(0.35, 0.06, -0.48)
    ];
    const rightHippoCurve = new THREE.CatmullRomCurve3(rightHippoPoints);
    const rightHippoGeo = new THREE.TubeGeometry(rightHippoCurve, 48, 0.11, 16, false);
    const rightHippoMesh = new THREE.Mesh(rightHippoGeo, hippoMat);
    rightHippoMesh.userData = { structureId: 'hippocampus', name: 'Right Hippocampus' };
    hippoGroup.add(rightHippoMesh);
    this.interactiveMeshes.push(rightHippoMesh);

    this.brainGroup.add(hippoGroup);

    // ----------------------------------------------------
    // 6. AMYGDALA (Bilateral Almond Emotion Nuclei)
    // ----------------------------------------------------
    const amygdalaGroup = new THREE.Group();
    amygdalaGroup.name = "amygdala";
    this.structures['amygdala'] = amygdalaGroup;

    const amygdalaGeo = new THREE.SphereGeometry(0.20, 24, 16);
    const amygdalaMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xff007f),
      emissive: new THREE.Color(0xd90429),
      emissiveIntensity: 0.7,
      roughness: 0.28,
      metalness: 0.15,
      transparent: true,
      opacity: 0.95
    });
    this.structureMaterials['amygdala'] = amygdalaMat;

    // Left Almond Nucleus
    const leftAmygdala = new THREE.Mesh(amygdalaGeo, amygdalaMat);
    leftAmygdala.position.set(-0.62, -0.32, 0.44);
    leftAmygdala.scale.set(0.95, 0.75, 1.25);
    leftAmygdala.rotation.set(0.2, -0.3, 0.1);
    leftAmygdala.userData = { structureId: 'amygdala', name: 'Left Amygdala' };
    amygdalaGroup.add(leftAmygdala);
    this.interactiveMeshes.push(leftAmygdala);

    // Right Almond Nucleus
    const rightAmygdala = new THREE.Mesh(amygdalaGeo.clone(), amygdalaMat);
    rightAmygdala.position.set(0.62, -0.32, 0.44);
    rightAmygdala.scale.set(0.95, 0.75, 1.25);
    rightAmygdala.rotation.set(0.2, 0.3, -0.1);
    rightAmygdala.userData = { structureId: 'amygdala', name: 'Right Amygdala' };
    amygdalaGroup.add(rightAmygdala);
    this.interactiveMeshes.push(rightAmygdala);

    this.brainGroup.add(amygdalaGroup);

    // ----------------------------------------------------
    // 7. BRAINSTEM (Midbrain, Pons, Medulla Oblongata)
    // ----------------------------------------------------
    const stemGroup = new THREE.Group();
    stemGroup.name = "brainstem";
    this.structures['brainstem'] = stemGroup;

    const stemMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x00b4d8),
      emissive: new THREE.Color(0x0077b6),
      emissiveIntensity: 0.6,
      roughness: 0.32,
      metalness: 0.15,
      transparent: true,
      opacity: 0.95
    });
    this.structureMaterials['brainstem'] = stemMat;

    // Midbrain (Mesencephalon cylinder)
    const midbrainGeo = new THREE.CylinderGeometry(0.28, 0.32, 0.4, 24);
    const midbrainMesh = new THREE.Mesh(midbrainGeo, stemMat);
    midbrainMesh.position.set(0, -0.18, -0.05);
    midbrainMesh.userData = { structureId: 'brainstem', name: 'Midbrain (Mesencephalon)' };
    stemGroup.add(midbrainMesh);
    this.interactiveMeshes.push(midbrainMesh);

    // Pons (Prominent bulbous anterior swelling)
    const ponsGeo = new THREE.SphereGeometry(0.38, 32, 24);
    const ponsMesh = new THREE.Mesh(ponsGeo, stemMat);
    ponsMesh.position.set(0, -0.56, 0.08);
    ponsMesh.scale.set(1.15, 0.85, 1.15);
    ponsMesh.userData = { structureId: 'brainstem', name: 'Pons' };
    stemGroup.add(ponsMesh);
    this.interactiveMeshes.push(ponsMesh);

    // Medulla Oblongata (Tapering cone down to spinal canal)
    const medullaGeo = new THREE.CylinderGeometry(0.26, 0.18, 0.75, 24);
    const medullaMesh = new THREE.Mesh(medullaGeo, stemMat);
    medullaMesh.position.set(0, -1.02, -0.06);
    medullaMesh.userData = { structureId: 'brainstem', name: 'Medulla Oblongata' };
    stemGroup.add(medullaMesh);
    this.interactiveMeshes.push(medullaMesh);

    this.brainGroup.add(stemGroup);

    // ----------------------------------------------------
    // 8. CEREBELLUM (Bilateral Folia Lobes & Vermis)
    // ----------------------------------------------------
    const cerebellumGroup = new THREE.Group();
    cerebellumGroup.name = "cerebellum";
    this.structures['cerebellum'] = cerebellumGroup;

    // Ribbed folia geometry for cerebellum
    const cereGeo = new THREE.SphereGeometry(0.65, 48, 36);
    this.applyCerebellarFolia(cereGeo);

    const cereMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xb5179e),
      emissive: new THREE.Color(0x7209b7),
      emissiveIntensity: 0.55,
      roughness: 0.35,
      metalness: 0.15,
      transparent: true,
      opacity: 0.95
    });
    this.structureMaterials['cerebellum'] = cereMat;

    // Left Cerebellar Hemisphere
    const leftCere = new THREE.Mesh(cereGeo, cereMat);
    leftCere.position.set(-0.48, -0.65, -0.82);
    leftCere.scale.set(0.9, 0.75, 0.95);
    leftCere.rotation.set(-0.2, 0.25, 0.15);
    leftCere.userData = { structureId: 'cerebellum', name: 'Left Cerebellar Hemisphere' };
    cerebellumGroup.add(leftCere);
    this.interactiveMeshes.push(leftCere);

    // Right Cerebellar Hemisphere
    const rightCere = new THREE.Mesh(cereGeo.clone(), cereMat);
    rightCere.position.set(0.48, -0.65, -0.82);
    rightCere.scale.set(0.9, 0.75, 0.95);
    rightCere.rotation.set(-0.2, -0.25, -0.15);
    rightCere.userData = { structureId: 'cerebellum', name: 'Right Cerebellar Hemisphere' };
    cerebellumGroup.add(rightCere);
    this.interactiveMeshes.push(rightCere);

    // Central Vermis
    const vermisGeo = new THREE.SphereGeometry(0.35, 24, 20);
    this.applyCerebellarFolia(vermisGeo);
    const vermisMesh = new THREE.Mesh(vermisGeo, cereMat);
    vermisMesh.position.set(0, -0.60, -0.88);
    vermisMesh.scale.set(0.6, 0.85, 0.9);
    vermisMesh.userData = { structureId: 'cerebellum', name: 'Cerebellar Vermis' };
    cerebellumGroup.add(vermisMesh);
    this.interactiveMeshes.push(vermisMesh);

    this.brainGroup.add(cerebellumGroup);
  },

  /**
   * Generates realistic anatomical cerebral gyri (crests) and sulci (fissures)
   * using multi-octave harmonic trigonometric displacement.
   */
  applyCorticalConvolutions: function (geometry) {
    const pos = geometry.attributes.position;
    const v = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);

      // Primary lobe shaping
      const zNorm = v.z / 1.4; // Anterior/posterior
      const yNorm = v.y / 1.4;

      // Flatten medial sagittal wall so hemispheres can sit cleanly side by side
      if (Math.abs(v.x) < 0.25) {
        v.x *= 0.75;
      }

      // Temporal lobe lateral downward protrusion
      if (yNorm < 0 && zNorm > -0.2 && zNorm < 0.4) {
        v.x *= 1.15;
        v.y *= 1.08;
      }

      // Multi-frequency harmonic gyri and sulci
      const f1 = 6.8;
      const f2 = 14.2;
      const f3 = 22.0;

      const gyrus1 = Math.sin(v.x * f1) * Math.cos(v.y * f1) * Math.sin(v.z * f1);
      const gyrus2 = Math.cos(v.x * f2 + 1.2) * Math.sin(v.y * f2 + 0.8) * Math.cos(v.z * f2);
      const gyrus3 = Math.sin(v.x * f3) * Math.sin(v.z * f3) * 0.5;

      const displacement = (gyrus1 * 0.085 + gyrus2 * 0.042 + gyrus3 * 0.018);

      // Push along vertex normal direction
      v.addScaledVector(v.clone().normalize(), displacement);

      pos.setXYZ(i, v.x, v.y, v.z);
    }

    geometry.computeVertexNormals();
  },

  /**
   * Applies horizontal laminar folia ridges characteristic of the cerebellum.
   */
  applyCerebellarFolia: function (geometry) {
    const pos = geometry.attributes.position;
    const v = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);

      // Tight horizontal ridges along Y
      const foliaFreq = 26.0;
      const ridge = Math.sin(v.y * foliaFreq) * 0.038;

      v.addScaledVector(v.clone().normalize(), ridge);
      pos.setXYZ(i, v.x, v.y, v.z);
    }

    geometry.computeVertexNormals();
  },

  /**
   * Builds an interactive 3D Synaptic Neural Particle Network
   * with firing action potentials flowing across axon tracks.
   */
  buildSynapticParticleNetwork: function () {
    const particleCount = 650;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const baseColor1 = new THREE.Color(0x00f5d4); // Cyan
    const baseColor2 = new THREE.Color(0x7b2cbf); // Purple
    const baseColor3 = new THREE.Color(0x4cc9f0); // Blue

    const tempColor = new THREE.Color();

    for (let i = 0; i < particleCount; i++) {
      // Distribute particles inside an organic ellipsoid matching the brain volume
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 1.6;

      const x = r * Math.sin(phi) * Math.cos(theta) * 0.85;
      const y = r * Math.sin(phi) * Math.sin(theta) * 0.75 + 0.2;
      const z = r * Math.cos(phi) * 1.05;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Gradient color based on position
      const mixRatio = (y + 1.0) / 2.0;
      tempColor.copy(baseColor1).lerp(baseColor2, mixRatio);
      if (Math.random() > 0.6) tempColor.lerp(baseColor3, 0.5);

      colors[i * 3] = tempColor.r;
      colors[i * 3 + 1] = tempColor.g;
      colors[i * 3 + 2] = tempColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Glowing point sprite
    const particleMat = new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particles = new THREE.Points(particleGeo, particleMat);
    this.brainGroup.add(this.particles);

    // Neural Network Axonal Synaptic Connecting Lines
    const lineIndices = [];
    const maxDistance = 0.55;

    for (let i = 0; i < 200; i++) {
      for (let j = i + 1; j < 200; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < maxDistance && Math.random() > 0.4) {
          lineIndices.push(i, j);
        }
      }
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    lineGeo.setIndex(lineIndices);

    const lineMat = new THREE.LineBasicMaterial({
      color: 0x4cc9f0,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending
    });

    this.synapseLines = new THREE.LineSegments(lineGeo, lineMat);
    this.brainGroup.add(this.synapseLines);
  },

  /**
   * Setup click detection / raycasting on 3D structures
   */
  setupInteractivity: function () {
    const self = this;

    const onPointerClick = function (event) {
      // Ignore clicks on UI cards, buttons, or modals
      if (event.target && event.target.closest('.hud-panel, .modal-card, .modal-backdrop, button, input, .progress-step-item, .drawer-item, #structure-drawer, #scroll-hint')) {
        return;
      }

      const camera = self.el.sceneEl && self.el.sceneEl.camera;
      if (!camera) return;

      const canvas = self.el.sceneEl.canvas;
      const rect = canvas ? canvas.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };

      const clientX = event.clientX !== undefined ? event.clientX : (event.touches && event.touches[0].clientX);
      const clientY = event.clientY !== undefined ? event.clientY : (event.touches && event.touches[0].clientY);

      if (clientX === undefined || clientY === undefined) return;

      self.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      self.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      self.raycaster.setFromCamera(self.mouse, camera);
      const intersects = self.raycaster.intersectObjects(self.interactiveMeshes, false);

      if (intersects.length > 0) {
        // Find closest hit that has a structureId
        for (let i = 0; i < intersects.length; i++) {
          const hit = intersects[i];
          const structId = hit.object.userData.structureId;
          if (structId) {
            // Trigger inspection event
            if (window.hudController) {
              window.hudController.openInspector(structId);
            }
            self.pulseStructure(structId);
            break;
          }
        }
      }
    };

    window.addEventListener('click', onPointerClick);
  },

  /**
   * Highlights a specific structure with high emissive intensity and color
   */
  setHighlight: function (structureId, colorHex) {
    this.activeHighlight = structureId;

    // Reset all structures to baseline emissive intensities
    for (const id in this.structureMaterials) {
      const mat = this.structureMaterials[id];
      if (!mat) continue;

      if (structureId === 'all') {
        mat.emissiveIntensity = 0.55;
      } else if (structureId === id) {
        mat.emissiveIntensity = 0.95;
        if (colorHex) {
          mat.emissive.set(colorHex);
        }
      } else {
        mat.emissiveIntensity = 0.20;
      }
    }
  },

  /**
   * Triggers a momentary glowing pulse on a structure (e.g., when clicked)
   */
  pulseStructure: function (structureId) {
    const mat = this.structureMaterials[structureId];
    if (mat) {
      const originalIntensity = mat.emissiveIntensity;
      mat.emissiveIntensity = 1.4;
      setTimeout(() => {
        mat.emissiveIntensity = originalIntensity;
      }, 600);
    }
  },

  /**
   * Updates cortex transparency & wireframe holographic state
   */
  setCortexState: function (opacity, wireframe) {
    this.targetCortexOpacity = opacity;
    this.cortexWireframe = wireframe;

    if (this.wireframeMaterial) {
      this.wireframeMaterial.opacity = wireframe ? 0.35 : 0.0;
    }
  },

  /**
   * Loads an external GLTF/GLB brain model if provided by user
   */
  loadGLBModel: function (fileUrlOrBlob) {
    const self = this;
    const loader = new THREE.GLTFLoader();

    loader.load(
      fileUrlOrBlob,
      function (gltf) {
        console.log("Custom 3D Brain Model loaded successfully:", gltf);
        // Hide procedural model and attach custom model
        self.brainGroup.children.forEach(c => { c.visible = false; });

        const customModel = gltf.scene;
        customModel.name = "custom_glb_brain";

        // Center and normalize bounding box scale
        const box = new THREE.Box3().setFromObject(customModel);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scaleFactor = 3.0 / maxDim;
        customModel.scale.setScalar(scaleFactor);

        const center = box.getCenter(new THREE.Vector3());
        customModel.position.sub(center.multiplyScalar(scaleFactor));

        self.brainGroup.add(customModel);

        if (window.hudController) {
          window.hudController.showToast("Custom GLTF Brain Model Loaded!");
        }
      },
      undefined,
      function (error) {
        console.error("Error loading GLTF model:", error);
        if (window.hudController) {
          window.hudController.showToast("Error loading model. Reverting to procedural brain.");
        }
      }
    );
  },

  /**
   * Per-frame animation tick
   */
  tick: function (time, deltaTime) {
    const dt = (deltaTime || 16) / 1000;
    this.pulseTime += dt;

    // Smooth cortex opacity transition
    if (this.cortexMaterial) {
      this.currentCortexOpacity += (this.targetCortexOpacity - this.currentCortexOpacity) * 0.08;
      this.cortexMaterial.opacity = this.currentCortexOpacity;
    }

    // Synaptic particle gentle breathing & rotation
    if (this.particles) {
      this.particles.rotation.y += dt * 0.04;
      const scale = 1.0 + Math.sin(this.pulseTime * 2.0) * 0.015;
      this.particles.scale.set(scale, scale, scale);
    }

    // Emissive pulsing for active highlighted structure
    if (this.activeHighlight && this.structureMaterials[this.activeHighlight]) {
      const activeMat = this.structureMaterials[this.activeHighlight];
      const pulse = 0.75 + Math.sin(this.pulseTime * 4.5) * 0.25;
      activeMat.emissiveIntensity = pulse;
    }
  }
});
