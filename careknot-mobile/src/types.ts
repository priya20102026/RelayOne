// A plain string, not a fixed union — Settings can add new circle members
// at runtime (see handleAddMember in App.tsx), so the id space isn't closed.
export type MemberId = string;

export type TaskCategory = "meals" | "transport" | "pharmacy" | "household" | "companionship" | "other";
export type TaskStatus = "open" | "claimed" | "done";

export interface FamilyMember {
  id: MemberId;
  name: string;
  role: string;
  avatarInitial: string;
  color: string;
  /** Used by the Wandering Safety Card's emergency-contacts list. */
  phone: string;
}

export interface CareRecipient {
  name: string;
  age: number;
  conditionNote: string;
  /** Height, build, hair, typical clothing — used by the Wandering Safety Card. */
  physicalDescription: string;
  /** Places they might wander to — used by the Wandering Safety Card. */
  wanderToPlaces: string[];
  /** Optional non-Circle emergency contact (e.g. a neighbor). */
  extraContactName?: string;
  extraContactPhone?: string;
  /** Used by the Medical Info screen's insurance card. */
  insurance?: InsuranceInfo;
  /** Used by the Medical Info screen's physician card. */
  primaryCarePhysician?: PrimaryCarePhysician;
  /** Chronological log of past medical visits, newest first. */
  medicalVisits?: MedicalVisit[];
}

/** Insurance card details, kept on-device for quick lookup during a visit. */
export interface InsuranceInfo {
  providerName: string;
  memberName: string;
  policyNumber: string;
  groupNumber: string;
  insurancePhone: string;
}

/** Primary care physician contact details. */
export interface PrimaryCarePhysician {
  name: string;
  specialty: string;
  phone: string;
  officeAddress: string;
}

/** A single logged past medical visit. */
export interface MedicalVisit {
  id: string;
  date: string;
  providerName: string;
  reason: string;
  notes: string;
}

/** The four "In This Moment" situations. */
export type Situation = "repeat_question" | "asking_deceased" | "agitated" | "refusing_care";

export interface MomentScript {
  id: Situation;
  label: string;
  icon: string;
  script: string;
  altScript: string;
  /** Shows the breathing exercise button on the response card. */
  showBreathe?: boolean;
}

/** Logged after an "In This Moment" session — feeds the Wellbeing score. */
export type MomentOutcome = "resolved" | "tough" | "needed_backup";

export interface CareTask {
  id: string;
  category: TaskCategory;
  title: string;
  description: string;
  durationLabel: string;
  postedBy: MemberId;
  assignedTo: MemberId | null;
  status: TaskStatus;
  urgent?: boolean;
  startTime?: string;
  endTime?: string;
  calendarEventId?: string;
  /** ISO timestamp set the moment the task is marked done. Used to
   * automatically remove the task from the board 24 hours later. */
  completedAt?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  dateLabel: string;
  startTime?: string;
  endTime?: string;
  memberId: MemberId | null;
  taskId?: string;
}

export interface ChatMessage {
  id: string;
  authorId: MemberId;
  text: string;
  timestamp: string;
}

export interface CircleInvite {
  circleName: string;
  code: string;
}

export interface JournalEntry {
  id: string;
  authorId: MemberId;
  timestamp: string;
  text: string;
  tags: string[];
}

export type LoadStatus = "steady" | "elevated" | "high";

export interface LoadFactor {
  label: string;
  detail: string;
}

export interface LoadSnapshot {
  score: number;
  status: LoadStatus;
  wellbeingBurden: number;
  taskVolume: number;
  supportRelief: number;
  factors: LoadFactor[];
  lastUpdated: string;
}
