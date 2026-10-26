import React, { useEffect, useMemo, useState } from "react";
import { View, ScrollView, StyleSheet, StatusBar, Alert } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { ThemeProvider, useTheme } from "./src/ThemeContext";

import Header from "./src/components/Header";
import CareRecipientBar from "./src/components/CareRecipientBar";
import LoadScoreCard from "./src/components/LoadScoreCard";
import WorkloadDistribution from "./src/components/WorkloadDistribution";
import TaskBoard from "./src/components/TaskBoard";
import JournalTimeline from "./src/components/JournalTimeline";
import NeedHelpModal from "./src/components/NeedHelpModal";
import CheckInModal from "./src/components/CheckInModal";
import GroupChat from "./src/components/GroupChat";
import CalendarScreen from "./src/components/CalendarScreen";
import AddEventModal from "./src/components/AddEventModal";
import SettingsScreen from "./src/components/SettingsScreen";
import MedicalInfoScreen from "./src/components/MedicalInfoScreen";
import WelcomeScreen from "./src/components/WelcomeScreen";
import MotivationalQuote from "./src/components/MotivationalQuote";
import QuickActionTiles from "./src/components/QuickActionTiles";
import InThisMomentModal from "./src/components/InThisMomentModal";
import AfterMomentPrompt from "./src/components/AfterMomentPrompt";
import WanderingSafetyModal from "./src/components/WanderingSafetyModal";
import BoxBreathingModal from "./src/components/BoxBreathingModal";
import TabBar, { ScreenId } from "./src/components/TabBar";

import {
  careRecipient as initialCareRecipient,
  careTasks as initialTasks,
  familyMembers,
  journalEntries as initialEntries,
  loadSnapshot as initialLoadSnapshot,
  chatMessages as initialChatMessages,
  circleInvite as initialInvite,
  calendarEvents as initialCalendarEvents,
} from "./src/mockData";
import {
  CalendarEvent,
  CareRecipient,
  CareTask,
  ChatMessage,
  CircleInvite,
  FamilyMember,
  InsuranceInfo,
  JournalEntry,
  LoadSnapshot,
  MemberId,
  MomentOutcome,
  PrimaryCarePhysician,
  TaskCategory,
} from "./src/types";
import { applyMomentOutcome, calculateCaregiverLoad, explainFactors, CheckIn } from "./src/loadEngine";
import { pickDailyQuote } from "./src/quotes";

const PRIMARY_CAREGIVER_ID: MemberId = "robert";

// A completed task stays crossed-off and visible for this long, then is
// removed from the board automatically. Pure local logic — no AI involved.
const DONE_TASK_LIFETIME_MS = 24 * 60 * 60 * 1000; // 24 hours

// Colors handed out to newly-added circle members, in order, skipping any
// already in use — keeps everyone visually distinct across the app.
const MEMBER_COLOR_PALETTE = ["#0E9F8E", "#3B82F6", "#D946EF", "#F59E0B", "#EF4444", "#8B5CF6", "#10B981", "#EC4899"];

function nextAvailableColor(existing: FamilyMember[]) {
  const used = new Set(existing.map((m) => m.color));
  return MEMBER_COLOR_PALETTE.find((c) => !used.has(c)) ?? MEMBER_COLOR_PALETTE[existing.length % MEMBER_COLOR_PALETTE.length];
}

function generateCode(circleName: string) {
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  const prefix = circleName.split(" ")[0].slice(0, 5).toUpperCase().replace(/[^A-Z]/g, "");
  return `${prefix}-${suffix}`;
}

function AppInner() {
  const theme = useTheme();

  // Shows the Welcome/demo front page once per app launch, before Home.
  const [hasEnteredApp, setHasEnteredApp] = useState(false);

  const [screen, setScreen] = useState<ScreenId>("home");
  const [currentMemberId, setCurrentMemberId] = useState<MemberId>(PRIMARY_CAREGIVER_ID);
  const [members, setMembers] = useState(familyMembers);
  const [tasks, setTasks] = useState<CareTask[]>(initialTasks);
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries);
  const [messages, setMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [invite, setInvite] = useState<CircleInvite>(initialInvite);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(initialCalendarEvents);
  const [loadSnapshot, setLoadSnapshot] = useState<LoadSnapshot>(initialLoadSnapshot);
  const [careRecipient, setCareRecipient] = useState<CareRecipient>(initialCareRecipient);
  const [needHelpVisible, setNeedHelpVisible] = useState(false);
  const [checkInVisible, setCheckInVisible] = useState(false);
  const [addEventVisible, setAddEventVisible] = useState(false);
  const [inThisMomentVisible, setInThisMomentVisible] = useState(false);
  const [wanderingVisible, setWanderingVisible] = useState(false);
  const [boxBreathingVisible, setBoxBreathingVisible] = useState(false);
  // Set the moment the "In This Moment" flow closes — shows the optional,
  // dismissable "How did that moment go?" prompt next time Home renders.
  const [pendingMomentCheck, setPendingMomentCheck] = useState(false);

  // Picked once when the app launches, based on today's load status — a
  // fresh quote shows up again next time the app is opened.
  const [dailyQuote] = useState(() => pickDailyQuote(initialLoadSnapshot.status));

  // Ticks once a minute purely so the 24-hour done-task cutoff below gets
  // re-checked while the app stays open — no network/AI calls involved.
  const [, forceTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // Tasks marked done more than 24 hours ago quietly drop off the board.
  // Everything else (open, claimed, and recently-done tasks) still shows.
  const visibleTasks = useMemo(() => {
    const now = Date.now();
    return tasks.filter((t) => {
      if (t.status !== "done" || !t.completedAt) return true;
      return now - new Date(t.completedAt).getTime() < DONE_TASK_LIFETIME_MS;
    });
  }, [tasks]);

  const currentMember = members.find((m) => m.id === currentMemberId)!;
  const primaryCaregiver = members.find((m) => m.id === PRIMARY_CAREGIVER_ID)!;

  const openTaskCount = useMemo(() => tasks.filter((t) => t.status === "open").length, [tasks]);

  // A calendar event linked to a task always shows that task's assignee, so the
  // Task Board, Calendar and Care Hub can never disagree about who has it.
  const syncedEvents = useMemo(
    () =>
      calendarEvents.map((e) => {
        if (!e.taskId) return e;
        const linked = tasks.find((t) => t.id === e.taskId);
        return linked ? { ...e, memberId: linked.assignedTo } : e;
      }),
    [calendarEvents, tasks]
  );

  const handleClaim = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: "claimed", assignedTo: currentMemberId } : t))
    );
    // Keep any linked calendar event's assignee in sync with the claim.
    setCalendarEvents((prev) =>
      prev.map((e) => (e.taskId === taskId ? { ...e, memberId: currentMemberId } : e))
    );
  };

  // Marking a task done crosses it off immediately (handled in TaskCard's
  // strikethrough style) and stamps completedAt, which the 24-hour filter
  // above uses to remove the task from the board automatically later.
  const handleMarkDone = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: "done", completedAt: new Date().toISOString() } : t))
    );
  };

  // "Ask the Circle" posts a real open task to the board. If a time window was
  // given, it also creates a linked Calendar event — claiming the task later
  // fills in the assignee's name on that event automatically.
  const handleNeedHelpSubmit = (payload: {
    title: string;
    category: TaskCategory;
    durationLabel: string;
    urgent: boolean;
    startTime?: string;
    endTime?: string;
  }) => {
    const taskId = `task-${Date.now()}`;
    let calendarEventId: string | undefined;

    const newTask: CareTask = {
      id: taskId,
      category: payload.category,
      title: payload.title,
      description: 'Requested via "Ask the Circle."',
      durationLabel: payload.durationLabel,
      postedBy: currentMemberId,
      assignedTo: null,
      status: "open",
      urgent: payload.urgent,
      startTime: payload.startTime,
      endTime: payload.endTime,
    };

    if (payload.startTime && payload.endTime) {
      calendarEventId = `event-${Date.now()}`;
      newTask.calendarEventId = calendarEventId;
      setCalendarEvents((prev) => [
        ...prev,
        {
          id: calendarEventId!,
          title: payload.title,
          dateLabel: "Today",
          startTime: payload.startTime,
          endTime: payload.endTime,
          memberId: null,
          taskId,
        },
      ]);
    }

    setTasks((prev) => [newTask, ...prev]);
    setNeedHelpVisible(false);
    setScreen("home");
  };

  const handleAddEntry = (text: string) => {
    const entry: JournalEntry = {
      id: `entry-${Date.now()}`,
      authorId: currentMemberId,
      timestamp: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      text,
      tags: [],
    };
    setEntries((prev) => [entry, ...prev]);
  };

  const handleSendChat = (text: string) => {
    const msg: ChatMessage = {
      id: `chat-${Date.now()}`,
      authorId: currentMemberId,
      text,
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, msg]);
  };

  // Each person sets their own role text from their own Settings view —
  // Robert, David, and Sarah can each put whatever role fits them.
  const handleUpdateRole = (memberId: MemberId, role: string) => {
    setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, role } : m)));
  };

  // Adds a new person to the circle — their own fresh color, no phone
  // number yet (editable later the same way everything else is).
  const handleAddMember = (payload: { name: string; role: string }) => {
    setMembers((prev) => [
      ...prev,
      {
        id: `member-${Date.now()}`,
        name: payload.name,
        role: payload.role,
        avatarInitial: payload.name.trim()[0]?.toUpperCase() ?? "?",
        color: nextAvailableColor(prev),
        phone: "",
      },
    ]);
  };

  // Removing someone frees up their claimed tasks and calendar events
  // rather than leaving them pointed at a person no longer in the circle.
  // SettingsScreen already guards against removing yourself, the primary
  // caregiver, or the last remaining member.
  const handleRemoveMember = (memberId: MemberId) => {
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    setTasks((prev) =>
      prev.map((t) => (t.assignedTo === memberId ? { ...t, assignedTo: null, status: "open" } : t))
    );
    setCalendarEvents((prev) => prev.map((e) => (e.memberId === memberId ? { ...e, memberId: null } : e)));
  };

  // Wandering Safety Card edits (description, wander-to places, extra
  // contact) update the same profile object shown across the rest of the app.
  const handleUpdateRecipient = (updates: Partial<CareRecipient>) => {
    setCareRecipient((prev) => ({ ...prev, ...updates }));
  };

  // Care Hub screen — insurance card, physician card, and appointment notes.
  const handleUpdateInsurance = (insurance: InsuranceInfo) => {
    setCareRecipient((prev) => ({ ...prev, insurance }));
  };

  const handleUpdatePhysician = (primaryCarePhysician: PrimaryCarePhysician) => {
    setCareRecipient((prev) => ({ ...prev, primaryCarePhysician }));
  };

  const handleAddVisit = (visit: { date: string; providerName: string; reason: string; notes: string }) => {
    setCareRecipient((prev) => ({
      ...prev,
      medicalVisits: [{ id: `visit-${Date.now()}`, ...visit }, ...(prev.medicalVisits ?? [])],
    }));
  };

  // The optional "How did that moment go?" follow-up — a small, deterministic
  // nudge to the Wellbeing score. Never required; the prompt is dismissable.
  const handleMomentOutcome = (outcome: MomentOutcome) => {
    setLoadSnapshot((prev) => applyMomentOutcome(prev, outcome));
    setPendingMomentCheck(false);
  };

  const handleGenerateNewCode = () => {
    setInvite((prev) => ({ ...prev, code: generateCode(prev.circleName) }));
  };

  const handleJoinWithCode = (_code: string) => {
    // In the real app this calls your backend to look up the circle for
    // `code` and add the current user as a member. No-op for now — the
    // confirmation alert is shown inside the Settings > Circle section.
  };

  const handleAddCalendarEvent = (payload: {
    title: string;
    dateLabel: string;
    startTime?: string;
    endTime?: string;
    memberId: MemberId | null;
  }) => {
    const event: CalendarEvent = { id: `event-${Date.now()}`, ...payload };
    setCalendarEvents((prev) => [...prev, event]);
  };

  // Check-In Today runs the real (non-AI) load calculation and updates the
  // score, status, and explainable factors shown on the Load Score card.
  const handleCheckInSubmit = (checkIn: CheckIn) => {
    const result = calculateCaregiverLoad(checkIn, {
      openTasks: openTaskCount,
      overdueTasks: 0,
      respiteHoursTakenThisWeek: 0,
    });
    setLoadSnapshot({
      score: result.score,
      status: result.status,
      wellbeingBurden: result.wellbeingBurden,
      taskVolume: result.taskVolume,
      supportRelief: result.supportRelief,
      factors: explainFactors(checkIn),
      lastUpdated: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    });
  };

  if (!hasEnteredApp) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.canvas }} edges={["top"]}>
        <StatusBar barStyle="dark-content" />
        <WelcomeScreen onGetStarted={() => setHasEnteredApp(true)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.canvas }} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {screen === "home" && (
        <>
          <Header members={members} currentMemberId={currentMemberId} onSwitchMember={setCurrentMemberId} />
          <CareRecipientBar
            recipient={careRecipient}
            currentMemberId={currentMemberId}
            isPrimaryCaregiver={currentMemberId === PRIMARY_CAREGIVER_ID}
            onCheckIn={() => setCheckInVisible(true)}
            onNeedHelp={() => setNeedHelpVisible(true)}
          />
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            <MotivationalQuote quote={dailyQuote} />
            {currentMemberId === PRIMARY_CAREGIVER_ID && (
              <QuickActionTiles
                onOpenInThisMoment={() => setInThisMomentVisible(true)}
                onOpenWanderingSafety={() => setWanderingVisible(true)}
                onOpenBoxBreathing={() => setBoxBreathingVisible(true)}
              />
            )}
            {currentMemberId === PRIMARY_CAREGIVER_ID && pendingMomentCheck && (
              <AfterMomentPrompt onAnswer={handleMomentOutcome} onDismiss={() => setPendingMomentCheck(false)} />
            )}
            <LoadScoreCard
              snapshot={loadSnapshot}
              currentMemberId={currentMemberId}
              primaryCaregiver={primaryCaregiver}
              currentMember={currentMember}
            />
            <WorkloadDistribution members={members} currentMemberId={currentMemberId} />
            <TaskBoard
              tasks={visibleTasks}
              members={members}
              currentMemberId={currentMemberId}
              primaryCaregiver={primaryCaregiver}
              onClaim={handleClaim}
              onMarkDone={handleMarkDone}
              onAddTask={() => setNeedHelpVisible(true)}
            />
            <JournalTimeline
              entries={entries}
              members={members}
              currentMemberId={currentMemberId}
              onAddEntry={handleAddEntry}
            />
            <View style={{ height: 8 }} />
          </ScrollView>
        </>
      )}

      {screen === "chat" && (
        <>
          <Header members={members} currentMemberId={currentMemberId} onSwitchMember={setCurrentMemberId} />
          <GroupChat
            circleName={invite.circleName}
            messages={messages}
            members={members}
            currentMemberId={currentMemberId}
            onSend={handleSendChat}
          />
        </>
      )}

      {screen === "calendar" && (
        <>
          <Header members={members} currentMemberId={currentMemberId} onSwitchMember={setCurrentMemberId} />
          <CalendarScreen
            events={syncedEvents}
            members={members}
            onAddEvent={() => setAddEventVisible(true)}
          />
        </>
      )}

      {screen === "medical" && (
        <>
          <Header members={members} currentMemberId={currentMemberId} onSwitchMember={setCurrentMemberId} />
          <MedicalInfoScreen
            recipient={careRecipient}
            events={syncedEvents.filter((e) => !tasks.some((t) => t.id === e.taskId && t.status === "done"))}
            onUpdateInsurance={handleUpdateInsurance}
            onUpdatePhysician={handleUpdatePhysician}
            onAddVisit={handleAddVisit}
          />
        </>
      )}

      {screen === "settings" && (
        <>
          <Header members={members} currentMemberId={currentMemberId} onSwitchMember={setCurrentMemberId} />
          <SettingsScreen
            invite={invite}
            members={members}
            currentMemberId={currentMemberId}
            primaryCaregiverId={PRIMARY_CAREGIVER_ID}
            onGenerateNewCode={handleGenerateNewCode}
            onJoinWithCode={handleJoinWithCode}
            onUpdateRole={handleUpdateRole}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
          />
        </>
      )}

      <TabBar active={screen} onChange={setScreen} />

      <NeedHelpModal
        visible={needHelpVisible}
        onClose={() => setNeedHelpVisible(false)}
        onSubmit={handleNeedHelpSubmit}
      />
      <CheckInModal
        visible={checkInVisible}
        onClose={() => setCheckInVisible(false)}
        onSubmit={handleCheckInSubmit}
      />
      <AddEventModal
        visible={addEventVisible}
        members={members}
        onClose={() => setAddEventVisible(false)}
        onSubmit={handleAddCalendarEvent}
      />
      <InThisMomentModal
        visible={inThisMomentVisible}
        emergencyContactName={
          careRecipient.extraContactPhone
            ? careRecipient.extraContactName
            : members.find((m) => m.id !== PRIMARY_CAREGIVER_ID)?.name
        }
        emergencyContactPhone={
          careRecipient.extraContactPhone || members.find((m) => m.id !== PRIMARY_CAREGIVER_ID)?.phone
        }
        onClose={() => {
          setInThisMomentVisible(false);
          // Not forced — just makes the optional after-prompt available
          // next time the caregiver is back on Home.
          setPendingMomentCheck(true);
        }}
      />
      <WanderingSafetyModal
        visible={wanderingVisible}
        recipient={careRecipient}
        members={members}
        onClose={() => setWanderingVisible(false)}
        onSave={handleUpdateRecipient}
      />
      <BoxBreathingModal visible={boxBreathingVisible} onClose={() => setBoxBreathingVisible(false)} />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppInner />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  // flex: 1 + minHeight: 0 keeps the list scrolling *inside* its area (below the
  // fixed header) instead of spilling over it on web.
  scroll: { flex: 1, minHeight: 0 },
  scrollContent: { padding: 16, paddingBottom: 48, gap: 16 },
});
