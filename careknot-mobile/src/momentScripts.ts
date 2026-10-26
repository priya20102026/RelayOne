import { MomentScript } from "./types";

// Static, bundled, no backend/AI — every script is plain pre-written text.
// Works fully offline, including airplane mode.
export const MOMENT_SITUATIONS: MomentScript[] = [
  {
    id: "repeat_question",
    label: "Asking the same question again",
    icon: "🔁",
    script:
      'Try answering the feeling, not the fact. Try: "That\'s a good question — I\'ve got it handled, don\'t worry."',
    altScript:
      'Answer briefly and redirect to an activity: "Good question — let\'s go water the plants together."',
  },
  {
    id: "asking_deceased",
    label: "Asking for someone who's passed",
    icon: "💭",
    script:
      '"Mom isn\'t here right now, but she loves you very much. Want to look at some photos of her together?"',
    altScript: '"She\'s not here today, but I\'m here with you. Tell me about a favorite memory of her."',
  },
  {
    id: "agitated",
    label: "Shouting or agitated",
    icon: "🌊",
    script: '"I hear you. Let\'s just sit here together for a moment."',
    altScript: '"You\'re safe. I\'m right here with you — let\'s slow down together."',
    showBreathe: true,
  },
  {
    id: "refusing_care",
    label: "Refusing care (bathing, dressing, etc.)",
    icon: "🤝",
    script: '"Let\'s try again in a few minutes — no rush."',
    altScript: '"Would it help if we did this a little differently today?"',
  },
];

export const CRISIS_RESOURCES = {
  suicideLifeline: "988",
  alzheimersHelpline: "1-800-272-3900",
  disclaimer: "If there's immediate danger to Margaret or anyone else, don't hesitate to call 911.",
};
