import {
  CalendarEvent,
  CareRecipient,
  CareTask,
  ChatMessage,
  CircleInvite,
  FamilyMember,
  JournalEntry,
  LoadSnapshot,
} from "./types";

export const familyMembers: FamilyMember[] = [
  { id: "robert", name: "Robert", role: "Primary caregiver", avatarInitial: "R", color: "#0E9F8E", phone: "(555) 010-1001" },
  { id: "david", name: "David", role: "Son", avatarInitial: "D", color: "#3B82F6", phone: "(555) 010-1002" },
  { id: "sarah", name: "Sarah", role: "Daughter", avatarInitial: "S", color: "#D946EF", phone: "(555) 010-1003" },
];

export const careRecipient: CareRecipient = {
  name: "Margaret",
  age: 82,
  conditionNote: "Early-stage Alzheimer's — needs daily check-ins and help with errands.",
  physicalDescription: "5'4\", slim build, short gray hair. Usually wears a light-colored cardigan.",
  wanderToPlaces: ["Former home on Elm St", "Lakeside Park", "Old workplace downtown"],
  extraContactName: "",
  extraContactPhone: "",
  insurance: {
    providerName: "BlueShield Senior Plus",
    memberName: "Margaret A. Lowery",
    policyNumber: "BS-884213",
    groupNumber: "GRP-5521",
    insurancePhone: "(800) 555-0188",
  },
  primaryCarePhysician: {
    name: "Dr. Elaine Kim",
    specialty: "Geriatric Medicine",
    phone: "(555) 010-4477",
    officeAddress: "412 Maple Health Center, Suite 3B",
  },
  medicalVisits: [
    {
      id: "visit-1",
      date: "Sep 18, 2026",
      providerName: "Dr. Elaine Kim",
      reason: "Quarterly check-up",
      notes: "Blood pressure stable. Continue current medication. Next visit in 3 months.",
    },
    {
      id: "visit-2",
      date: "Jul 2, 2026",
      providerName: "Dr. Elaine Kim",
      reason: "Memory assessment",
      notes: "Mild progression noted. Recommended daily routine and reduced evening screen time.",
    },
  ],
};

export const loadSnapshot: LoadSnapshot = {
  score: 42,
  status: "elevated",
  wellbeingBurden: 48,
  taskVolume: 40,
  supportRelief: 15,
  factors: [
    { label: "Disrupted nights", detail: "Woke up twice overnight." },
    { label: "Heavy care hours", detail: "6h of direct care today." },
  ],
  lastUpdated: "9:12 AM",
};

export const careTasks: CareTask[] = [
  {
    id: "task-1",
    category: "meals",
    title: "Pick up groceries for the week",
    description: "List is on the fridge — mostly produce and her usual oatmeal.",
    durationLabel: "~45 min",
    postedBy: "robert",
    assignedTo: null,
    status: "open",
    urgent: true,
    startTime: "4:00 PM",
    endTime: "5:00 PM",
    calendarEventId: "event-1",
  },
  {
    id: "task-2",
    category: "pharmacy",
    title: "Refill blood pressure prescription",
    description: "Pharmacy on Main St, should be ready for pickup.",
    durationLabel: "~20 min",
    postedBy: "robert",
    assignedTo: "david",
    status: "claimed",
  },
  {
    id: "task-3",
    category: "companionship",
    title: "Sit with Mom during her shows",
    description: "She likes company Tuesday evenings.",
    durationLabel: "~1 hr",
    postedBy: "sarah",
    assignedTo: "sarah",
    status: "done",
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

export const journalEntries: JournalEntry[] = [
  {
    id: "entry-1",
    authorId: "robert",
    timestamp: "Oct 2, 8:03 PM",
    text: "Good day overall — she ate well and was in good spirits after her walk.",
    tags: [],
  },
  {
    id: "entry-2",
    authorId: "sarah",
    timestamp: "Oct 1, 6:40 PM",
    text: "A little confused about the time this evening, reassured her and it passed.",
    tags: [],
  },
];

export const chatMessages: ChatMessage[] = [
  { id: "chat-1", authorId: "david", text: "Grabbing her prescription on my way home.", timestamp: "2:10 PM" },
  { id: "chat-2", authorId: "robert", text: "Thank you, that helps a lot today.", timestamp: "2:12 PM" },
];

export const circleInvite: CircleInvite = {
  circleName: "Margaret's Circle",
  code: "MARGA-7F2K",
};

export const calendarEvents: CalendarEvent[] = [
  {
    id: "event-1",
    title: "Pick up groceries for the week",
    dateLabel: "Today",
    startTime: "4:00 PM",
    endTime: "5:00 PM",
    memberId: null,
    taskId: "task-1",
  },
  {
    id: "event-2",
    title: "Doctor's appointment — Dr. Kim",
    dateLabel: "Tomorrow",
    startTime: "10:00 AM",
    endTime: "11:00 AM",
    memberId: "robert",
  },
];
