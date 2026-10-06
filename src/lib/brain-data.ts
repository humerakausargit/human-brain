// Section + structure data for the brain journey. Shared by the 3D scene and the UI.
export type StructureId =
  | "cerebrum"
  | "corpus"
  | "thalamus"
  | "hypothalamus"
  | "hippocampus"
  | "amygdala"
  | "brainstem"
  | "cerebellum";

export interface Section {
  key: string;
  title: string;
  text: string;
  focus: StructureId | null;
  cam: [number, number, number];
  target: [number, number, number];
  cutaway: number; // 0 = opaque cortex, 1 = fully see-through
}

export const SECTIONS: Section[] = [
  { key: "intro", title: "Inside the Human Brain", text: "Scroll to explore the structures that control the human body.", focus: null, cam: [-0.8, 0.3, 5.2], target: [-0.8, -0.1, 0], cutaway: 0 },
  { key: "cerebrum", title: "Cerebrum", text: "Controls thinking, memory, senses, emotions and voluntary movement.", focus: "cerebrum", cam: [2.4, 1.9, 2.6], target: [0, 0.2, 0], cutaway: 0 },
  { key: "corpus", title: "Corpus Callosum", text: "A thick bundle of nerve fibers that allows the two brain hemispheres to communicate.", focus: "corpus", cam: [2.2, 0.9, 0.6], target: [0, 0.2, 0], cutaway: 1 },
  { key: "thalamus", title: "Thalamus", text: "Acts as an important relay center for sensory information.", focus: "thalamus", cam: [1.4, 0.5, 1.3], target: [0, -0.05, -0.1], cutaway: 1 },
  { key: "hypothalamus", title: "Hypothalamus", text: "Helps regulate temperature, hunger, thirst, sleep and hormone-related functions.", focus: "hypothalamus", cam: [1.0, -0.35, 1.6], target: [0, -0.3, 0.12], cutaway: 1 },
  { key: "hippocampus", title: "Hippocampus", text: "Plays an important role in learning and forming memories.", focus: "hippocampus", cam: [2.0, -0.2, -0.9], target: [0.5, -0.35, -0.2], cutaway: 1 },
  { key: "amygdala", title: "Amygdala", text: "Helps process emotions and emotional responses.", focus: "amygdala", cam: [1.9, -0.3, 1.3], target: [0.52, -0.42, 0.25], cutaway: 1 },
  { key: "brainstem", title: "Brainstem", text: "Connects the brain with the spinal cord and helps control vital automatic functions.", focus: "brainstem", cam: [1.9, -1.0, 1.2], target: [0, -0.85, -0.35], cutaway: 0.85 },
  { key: "cerebellum", title: "Cerebellum", text: "Helps maintain balance, posture and coordination of movement.", focus: "cerebellum", cam: [1.6, -0.6, -2.4], target: [0, -0.6, -0.85], cutaway: 0.3 },
  { key: "outro", title: "The Brain Works as One", text: "Billions of neurons and specialized structures work together to control the human body.", focus: null, cam: [-3.2, 1.2, 4.0], target: [0, -0.1, 0], cutaway: 0.55 },
];

export const STRUCTURE_INFO: Record<StructureId, { name: string; location: string; fn: string; fact: string }> = {
  cerebrum: { name: "Cerebrum", location: "Upper, largest part of the brain, split into left and right hemispheres.", fn: "Thought, language, memory, perception and voluntary movement.", fact: "It makes up about 85% of the brain's weight." },
  corpus: { name: "Corpus Callosum", location: "Deep in the midline, beneath the cortex, bridging both hemispheres.", fn: "Carries signals between the left and right hemispheres.", fact: "It contains roughly 200 million nerve fibers." },
  thalamus: { name: "Thalamus", location: "Paired egg-shaped masses at the center of the brain.", fn: "Relays sensory and motor signals to the cortex.", fact: "Every sense except smell passes through it first." },
  hypothalamus: { name: "Hypothalamus", location: "Just below the thalamus, above the pituitary gland.", fn: "Regulates body temperature, hunger, thirst, sleep and hormones.", fact: "It's about the size of an almond." },
  hippocampus: { name: "Hippocampus", location: "Inside the medial temporal lobe of each hemisphere.", fn: "Forms new memories and supports spatial navigation.", fact: "Its name comes from the Greek for 'seahorse', after its shape." },
  amygdala: { name: "Amygdala", location: "In front of the hippocampus, deep in the temporal lobe.", fn: "Processes emotions, especially fear and reward.", fact: "It can react to a threat before you're consciously aware of it." },
  brainstem: { name: "Brainstem", location: "Base of the brain: midbrain, pons and medulla, continuing into the spinal cord.", fn: "Controls breathing, heart rate, swallowing and alertness.", fact: "All nerve signals between brain and body pass through it." },
  cerebellum: { name: "Cerebellum", location: "Back and bottom of the brain, under the occipital lobes.", fn: "Coordinates balance, posture and smooth movement.", fact: "It holds more than half of all the brain's neurons." },
};

// Mutable scroll store read inside the render loop (no React re-renders per frame).
export const scrollState = { progress: 0 };
