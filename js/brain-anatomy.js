/**
 * Brain Anatomy Data & Section Configurations
 * "Inside the Human Brain" - Interactive 3D Educational Project
 */

const BRAIN_SECTIONS = [
  {
    id: "intro",
    num: "01",
    tag: "OVERVIEW",
    title: "Inside the Human Brain",
    subtitle: "Scroll to explore how the brain works.",
    description: "The human brain is the command center of the nervous system, housing approximately 86 billion neurons and 100 trillion synaptic connections. Scroll down to embark on a guided 3D anatomical journey through its core internal structures.",
    camera: {
      position: { x: 0, y: 1.2, z: 6.0 },
      target: { x: 0, y: 0.1, z: 0 },
      fov: 50
    },
    brainRotation: { x: 0.1, y: 0, z: 0 },
    autoRotate: true,
    highlightStructure: null,
    cortexOpacity: 0.96,
    cortexWireframe: false,
    color: "#00f5d4",
    bulletPoints: [
      "Weight: ~1.4 kilograms (~3 lbs)",
      "Energy Consumption: ~20% of total body oxygen & calories",
      "Network: ~86 billion neurons linked by 100+ trillion synapses"
    ]
  },
  {
    id: "cerebrum",
    num: "02",
    tag: "TELENCEPHALON",
    title: "Cerebrum",
    subtitle: "The seat of conscious thought, sensory integration, and personality.",
    description: "Cerebrum — Responsible for thinking, memory, emotions, senses and voluntary movement.",
    camera: {
      position: { x: 2.2, y: 1.8, z: 3.8 },
      target: { x: 0.3, y: 0.4, z: 0 },
      fov: 48
    },
    brainRotation: { x: 0.2, y: 0.4, z: 0 },
    autoRotate: false,
    highlightStructure: "cerebrum",
    cortexOpacity: 0.95,
    cortexWireframe: false,
    color: "#4cc9f0",
    bulletPoints: [
      "Frontal Lobe: Decision making, problem solving, motor control, personality",
      "Parietal Lobe: Somatosensory processing, spatial navigation, tactile sensation",
      "Occipital Lobe: Primary visual cortex interpreting shape, color, and motion",
      "Temporal Lobe: Auditory perception, memory encoding, speech comprehension"
    ]
  },
  {
    id: "corpus-callosum",
    num: "03",
    tag: "COMMISSURAL TRACT",
    title: "Corpus Callosum",
    subtitle: "The great axonal bridge unifying both cerebral hemispheres.",
    description: "A thick, C-shaped bundle of over 200 million myelinated axonal nerve fibers bridging the left and right cerebral hemispheres. It facilitates seamless interhemispheric communication, sensory cross-talk, and unified motor coordination.",
    camera: {
      position: { x: 0.8, y: 1.0, z: 2.6 },
      target: { x: 0.0, y: 0.35, z: 0.0 },
      fov: 45
    },
    brainRotation: { x: 0.15, y: 0.8, z: 0 },
    autoRotate: false,
    highlightStructure: "corpus_callosum",
    cortexOpacity: 0.20,
    cortexWireframe: true,
    color: "#e056fd",
    bulletPoints: [
      "Fiber Count: Exceeds 200 million axonal fibers",
      "Structure: Rostrum, Genu, Body (Trunk), and Splenium",
      "Clinical Note: Surgical transection (corpus callosotomy) causes 'split-brain syndrome'"
    ]
  },
  {
    id: "thalamus",
    num: "04",
    tag: "DIENCEPHALON",
    title: "Thalamus",
    subtitle: "The brain's primary sensory routing and filtering switchboard.",
    description: "Thalamus — The grand sensory relay station. All sensory signals from the body (except olfaction/smell) first pass through the thalamic nuclei, which filter, preprocess, and route them to their designated cerebral cortex areas.",
    camera: {
      position: { x: 1.2, y: 0.5, z: 2.1 },
      target: { x: 0.0, y: 0.15, z: 0.0 },
      fov: 42
    },
    brainRotation: { x: 0.1, y: 0.5, z: 0 },
    autoRotate: false,
    highlightStructure: "thalamus",
    cortexOpacity: 0.15,
    cortexWireframe: true,
    color: "#ffd166",
    bulletPoints: [
      "Paired symmetric egg-shaped nuclear masses atop the brainstem",
      "Sensory Gatekeeper: Determines what enters conscious awareness",
      "Regulates alertness, consciousness, and sleep-wake cycles"
    ]
  },
  {
    id: "hypothalamus",
    num: "05",
    tag: "HOMEOSTASIS CENTER",
    title: "Hypothalamus",
    subtitle: "The master control center for internal biological equilibrium.",
    description: "Hypothalamus — Helps regulate temperature, hunger, thirst, sleep and hormones. Though weighing only 4 grams, it acts as the primary bridge linking the central nervous system to the endocrine system via the pituitary gland.",
    camera: {
      position: { x: 0.7, y: -0.2, z: 1.7 },
      target: { x: 0.0, y: -0.15, z: 0.1 },
      fov: 40
    },
    brainRotation: { x: -0.05, y: 0.35, z: 0 },
    autoRotate: false,
    highlightStructure: "hypothalamus",
    cortexOpacity: 0.14,
    cortexWireframe: true,
    color: "#06d6a0",
    bulletPoints: [
      "Maintains Homeostasis: Body temperature, blood pressure, osmolarity",
      "Controls the 'Four Fs': Feeding, Fighting, Fleeing, and Mating",
      "Synthesizes oxytocin, vasopressin, and pituitary-releasing hormones"
    ]
  },
  {
    id: "hippocampus",
    num: "06",
    tag: "LIMBIC SYSTEM",
    title: "Hippocampus",
    subtitle: "The master architect of episodic memory and cognitive mapping.",
    description: "Hippocampus — Plays a critical role in memory and learning. Shaped like a curved seahorse, it is responsible for converting fleeting short-term memories into enduring long-term storage and creating internal cognitive spatial maps.",
    camera: {
      position: { x: -1.4, y: 0.0, z: 1.9 },
      target: { x: -0.4, y: -0.1, z: -0.1 },
      fov: 44
    },
    brainRotation: { x: 0.15, y: -0.5, z: 0 },
    autoRotate: false,
    highlightStructure: "hippocampus",
    cortexOpacity: 0.15,
    cortexWireframe: true,
    color: "#8338ec",
    bulletPoints: [
      "Etymology: Named after the Greek word for 'seahorse' (hippos = horse, kampos = sea monster)",
      "Memory Consolidation: Converts working memory into neocortical long-term memory",
      "Place Cells: Discovered here, acting as the brain's internal GPS system"
    ]
  },
  {
    id: "amygdala",
    num: "07",
    tag: "EMOTION & THREAT",
    title: "Amygdala",
    subtitle: "The primal sentinel for danger detection and emotional salience.",
    description: "Amygdala — Connected with emotions, especially fear and emotional responses. Two almond-shaped clusters perched at the anterior tip of each hippocampus that rapidly evaluate environmental threats and initiate fight-or-flight survival reflexes.",
    camera: {
      position: { x: -1.0, y: -0.2, z: 1.5 },
      target: { x: -0.3, y: -0.25, z: 0.2 },
      fov: 38
    },
    brainRotation: { x: 0.1, y: -0.3, z: 0 },
    autoRotate: false,
    highlightStructure: "amygdala",
    cortexOpacity: 0.14,
    cortexWireframe: true,
    color: "#ff007f",
    bulletPoints: [
      "Etymology: Derived from the Greek word for 'almond'",
      "Threat Detection: Triggers the autonomic fight-or-flight surge in milliseconds",
      "Emotional Memory: Tags memories with strong emotional charge (joy, trauma, phobias)"
    ]
  },
  {
    id: "brainstem",
    num: "08",
    tag: "AUTONOMIC CORE",
    title: "Brainstem",
    subtitle: "The vital conduit sustaining life-support reflexes.",
    description: "Brainstem — Controls important automatic functions such as breathing and heart rate. Composed of the midbrain, pons, and medulla oblongata, it coordinates unconscious visceral reflexes and channels all sensory-motor pathways to the spinal cord.",
    camera: {
      position: { x: 0.2, y: -1.5, z: 2.8 },
      target: { x: 0.0, y: -0.9, z: -0.1 },
      fov: 46
    },
    brainRotation: { x: -0.1, y: 0.2, z: 0 },
    autoRotate: false,
    highlightStructure: "brainstem",
    cortexOpacity: 0.20,
    cortexWireframe: true,
    color: "#00b4d8",
    bulletPoints: [
      "Midbrain: Auditory and visual reflex centers (superior/inferior colliculi)",
      "Pons: Respiratory rhythm regulation and relay between cerebrum and cerebellum",
      "Medulla Oblongata: Cardiac rate, vasomotor tone, vomiting, coughing, and swallowing"
    ]
  },
  {
    id: "cerebellum",
    num: "09",
    tag: "MOTOR HARMONY",
    title: "Cerebellum",
    subtitle: "'The Little Brain' orchestrating exquisite motor precision and rhythm.",
    description: "Cerebellum — Responsible for balance, coordination and movement. Nestled beneath the occipital lobes with distinctive folded horizontal folia, it fine-tunes motor execution, smooths muscle contractions, and supports procedural muscle memory.",
    camera: {
      position: { x: 1.8, y: -0.7, z: -2.8 },
      target: { x: 0.0, y: -0.6, z: -0.7 },
      fov: 48
    },
    brainRotation: { x: 0.1, y: 2.8, z: 0 },
    autoRotate: false,
    highlightStructure: "cerebellum",
    cortexOpacity: 0.35,
    cortexWireframe: false,
    color: "#b5179e",
    bulletPoints: [
      "Houses over 50% of the entire brain's neurons despite occupying only 10% of volume",
      "Contains Purkinje cells, among the most arborized and intricate neurons in biology",
      "Motor Learning: Essential for riding a bicycle, playing piano, or catching a ball"
    ]
  },
  {
    id: "final-view",
    num: "10",
    tag: "SYNTHESIS",
    title: "The Unified Nervous System",
    subtitle: "A synchronized symphony of 86 billion interconnected neurons.",
    description: "The brain is a complex network where every structure works together. From unconscious autonomic heartbeats to higher philosophical inquiry, every sensation, memory, and emotion emerges from the synchronized orchestra of these anatomical regions.",
    camera: {
      position: { x: 0, y: 1.2, z: 6.2 },
      target: { x: 0, y: 0.1, z: 0 },
      fov: 52
    },
    brainRotation: { x: 0.15, y: 0.6, z: 0 },
    autoRotate: true,
    highlightStructure: "all",
    cortexOpacity: 0.45,
    cortexWireframe: false,
    color: "#38bdf8",
    bulletPoints: [
      "Neuroplasticity: Synaptic pathways continuously rewire in response to learning and experience",
      "Connectome: The complete comprehensive map of neural connections in the human brain",
      "Click on any glowing structure in 3D to inspect its detailed anatomical profile!"
    ]
  }
];

// Comprehensive Anatomical Metadata for 3D Click-to-Inspect Raycasting & HUD Pins
const ANATOMY_DETAILS = {
  cerebrum: {
    id: "cerebrum",
    name: "Cerebrum (Cerebral Cortex)",
    latin: "Telencephalon",
    category: "Forebrain",
    color: "#4cc9f0",
    anchor: { x: 0.8, y: 0.7, z: 0.4 },
    role: "Thinking, memory, senses, emotions & voluntary movement",
    description: "The largest part of the brain, divided into left and right hemispheres. Its wrinkled outer layer (the cerebral cortex) contains billions of gyri (folds) and sulci (grooves) that maximize surface area for processing power.",
    keyStructures: [
      "Frontal Lobe — Executive control & planning",
      "Parietal Lobe — Spatial & somatosensory sensation",
      "Temporal Lobe — Memory & auditory decoding",
      "Occipital Lobe — Primary visual cortex"
    ],
    trivia: "Spread out completely flat, the human cerebral cortex would cover roughly 2.5 square feet (the size of an unfolded dinner napkin or large pillowcase)!"
  },
  corpus_callosum: {
    id: "corpus_callosum",
    name: "Corpus Callosum",
    latin: "Corpus Callosum",
    category: "White Matter Commissure",
    color: "#e056fd",
    anchor: { x: 0.0, y: 0.45, z: 0.0 },
    role: "Interhemispheric communication bridge",
    description: "The primary commissural tract bridging the two hemispheres. It ensures that perceptions, thoughts, and motor intentions synthesized in one hemisphere are instantaneously shared with the other.",
    keyStructures: [
      "Rostrum & Genu (Anterior curve)",
      "Body / Trunk (Central arch)",
      "Splenium (Thick posterior curve)"
    ],
    trivia: "In patients with severe epilepsy who underwent 'split-brain' surgery cutting this bridge, each brain hemisphere learned to perceive the world independently!"
  },
  thalamus: {
    id: "thalamus",
    name: "Thalamus",
    latin: "Thalamus Dorsalis",
    category: "Diencephalon",
    color: "#ffd166",
    anchor: { x: 0.35, y: 0.2, z: 0.0 },
    role: "Primary sensory & motor relay station",
    description: "Paired symmetrical ovoid nuclei situated at the upper end of the brainstem. It functions as the central routing junction for all incoming sensory data, with the lone exception of olfactory (smell) inputs which bypass it directly to the limbic cortex.",
    keyStructures: [
      "Lateral Geniculate Nucleus (Visual relay)",
      "Medial Geniculate Nucleus (Auditory relay)",
      "Ventral Posterolateral Nucleus (Touch & pain)",
      "Reticular Nucleus (Conscious sensory gating)"
    ],
    trivia: "The word Thalamus comes from Greek meaning 'inner chamber' or 'bridal bed', reflecting its deep central placement in the skull."
  },
  hypothalamus: {
    id: "hypothalamus",
    name: "Hypothalamus",
    latin: "Hypothalamus",
    category: "Diencephalon & Endocrine Link",
    color: "#06d6a0",
    anchor: { x: 0.0, y: -0.15, z: 0.25 },
    role: "Temperature, hunger, thirst, sleep & hormones",
    description: "Though composing less than 1% of the brain's total volume, this tiny powerhouse orchestrates the body's entire internal equilibrium, autonomic balance, and neuroendocrine synthesis.",
    keyStructures: [
      "Suprachiasmatic Nucleus (Master 24-hr circadian clock)",
      "Thermoregulatory Centers (Sweating & shivering)",
      "Satiety & Hunger Centers (Ghrelin & leptin response)",
      "Infundibulum & Pituitary Stalk (Hormone cascade)"
    ],
    trivia: "If your core body temperature deviates by merely 2 degrees Celsius, your hypothalamus automatically initiates vasoconstriction or profuse diaphoresis to protect your cells!"
  },
  hippocampus: {
    id: "hippocampus",
    name: "Hippocampus",
    latin: "Cornu Ammonis",
    category: "Limbic System",
    color: "#8338ec",
    anchor: { x: -0.6, y: -0.15, z: -0.15 },
    role: "Memory consolidation & spatial navigation",
    description: "An elegantly curved bilateral structure arching inside the temporal lobe. It acts like an indexer that synthesizes disparate sensory memories and trains the cortex to store them permanently.",
    keyStructures: [
      "Dentate Gyrus (One of rare sites of adult neurogenesis)",
      "CA1, CA2, CA3, CA4 Pyramidal Fields",
      "Subiculum & Entorhinal Input Pathways",
      "Place & Grid Cells (Internal neural cartography)"
    ],
    trivia: "London taxi drivers who memorize 'The Knowledge' (25,000 streets) develop significantly larger posterior hippocampi than the general population due to neuroplastic adaptation!"
  },
  amygdala: {
    id: "amygdala",
    name: "Amygdala",
    latin: "Corpus Amygdaloideum",
    category: "Limbic System",
    color: "#ff007f",
    anchor: { x: -0.5, y: -0.3, z: 0.35 },
    role: "Emotion processing, fear conditioning & threat response",
    description: "An almond-shaped nuclear complex anterior to each hippocampus. It scans incoming stimuli for immediate emotional significance and signals the hypothalamus to release adrenaline during acute danger.",
    keyStructures: [
      "Basolateral Nuclei (Sensory convergence & valuation)",
      "Central Nucleus (Autonomic output & fight-or-flight trigger)",
      "Cortical Nucleus (Olfactory emotion integration)"
    ],
    trivia: "The amygdala can detect a predator or snake shape in your peripheral vision and trigger a jump reflex in 20 milliseconds—well before your visual cortex consciously recognizes what you saw!"
  },
  brainstem: {
    id: "brainstem",
    name: "Brainstem",
    latin: "Truncus Encephali",
    category: "Brainstem & Autonomic Core",
    color: "#00b4d8",
    anchor: { x: 0.0, y: -0.9, z: -0.1 },
    role: "Breathing, heart rate, blood pressure & sleep",
    description: "The stalk connecting the cerebral hemispheres with the spinal cord. It regulates vital vegetative systems that sustain biological life continuously without conscious effort.",
    keyStructures: [
      "Midbrain (Mesencephalon: Dopamine substantia nigra, reflexes)",
      "Pons (Metencephalon: Respiratory rhythm generator, cranial nerves)",
      "Medulla Oblongata (Myelencephalon: Cardiac center, vasomotor tone)",
      "Reticular Activating System (Arousal & wakefulness)"
    ],
    trivia: "Because all ascending and descending motor pathways pass through the brainstem, a disruption of just a few millimeters here can instantly halt spontaneous breathing."
  },
  cerebellum: {
    id: "cerebellum",
    name: "Cerebellum",
    latin: "Cerebellum ('Little Brain')",
    category: "Metencephalon",
    color: "#b5179e",
    anchor: { x: 0.0, y: -0.65, z: -0.9 },
    role: "Balance, coordination, timing & motor learning",
    description: "Positioned below the posterior cerebrum, the cerebellum acts as a high-speed predictive error-correction computer for physical movement, constantly comparing intention with reality.",
    keyStructures: [
      "Cerebellar Hemispheres (Lateral motor coordination)",
      "Vermis (Central balance & axial posture)",
      "Folia (Tightly compressed laminar cortical ridges)",
      "Deep Cerebellar Nuclei (Dentate, Emboliform, Globose, Fastigial)"
    ],
    trivia: "Although making up only 10% of total brain mass, the tightly packed cerebellum contains over 50 billion neurons—more than the rest of the brain combined!"
  }
};

// Export to window for global access in Vanilla JS
window.BRAIN_SECTIONS = BRAIN_SECTIONS;
window.ANATOMY_DETAILS = ANATOMY_DETAILS;
