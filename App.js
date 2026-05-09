import React, { useState, useCallback, useRef } from 'react';
import {
  SafeAreaView, View, StyleSheet, TouchableOpacity,
  Text, StatusBar, useWindowDimensions, ScrollView, Platform, LogBox, Animated
} from 'react-native';

LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);
import { ThemeProvider, useTheme } from './src/ThemeContext';
import { useKeyboardShortcuts } from './src/utils/useKeyboardShortcuts';
import { useTasks } from './src/hooks/useTasks';
import { useHabits } from './src/hooks/useHabits';
import { useFocusTracking } from './src/hooks/useFocusTracking';
import { useAppNavigation } from './src/hooks/useAppNavigation';
import { saveFocusStats } from './src/utils/storage';
import {
  Q_URGENT_IMPORTANT, Q_NOT_URGENT_IMPORTANT,
  Q_URGENT_NOT_IMPORTANT, Q_NOT_URGENT_NOT_IMPORTANT,
  TC_ALL,
} from './src/constants';
import TaskQuadrant from './src/components/TaskQuadrant';
import AddTaskModal from './src/components/AddTaskModal';
import RightPanel from './src/components/RightPanel';
import AgendaPlanner from './src/components/planner/AgendaPlanner';
import FilterBar from './src/components/FilterBar';
import SearchBar from './src/components/SearchBar';
import InsightsBar from './src/components/InsightsBar';
import PomodoroTimer from './src/components/PomodoroTimer';
import ShortcutHint from './src/components/ShortcutHint';
import DailyBriefingModal from './src/components/DailyBriefingModal';
import Navigation from './src/components/Navigation';
import OnboardingTutorial from './src/components/OnboardingTutorial';
import HabitsView from './src/components/HabitsView';
import SettingsView from './src/components/SettingsView';
import StatsPanel from './src/components/StatsPanel';
import ErrorBoundary from './src/components/ErrorBoundary';

// ─────────────────────────────────────────────────────────────────────────────
// Inner app (has access to ThemeContext)
// ─────────────────────────────────────────────────────────────────────────────
function AppInner() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 800;
  const { theme } = useTheme();

  // ── Custom hooks ──────────────────────────────────────────────────
  const {
    tasks, editingTask, setEditingTask,
    handleSaveTask, handleEditTask, handleCompleteTask,
    handleDeleteTask, handleMoveTask,
  } = useTasks();

  const {
    habits, setHabits, logs,
    handleToggleHabit, autoCompleteHabit,
  } = useHabits();

  const {
    focusMode, setFocusMode, activeFocusHabitId, setActiveFocusHabitId,
    timerActive, setTimerActive, activeTask,
    todayFocusStr, todaySessionsCount, currentStreak, bestDayStr,
    recordFocusSession,
  } = useFocusTracking(tasks, habits);

  const {
    activeTab, mobileTab, setMobileTab,
    showOnboarding, setShowOnboarding, showBriefing, setShowBriefing,
    prodSettings, setProdSettings,
    isNavLocked, toastMessage, toastAnim,
    showToast, handleTabChange, completeOnboarding,
  } = useAppNavigation(setFocusMode, timerActive);

  // ── Local UI state ────────────────────────────────────────────────
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeFilter, setActiveFilter] = useState(TC_ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);

  // ── Keyboard shortcuts ────────────────────────────────────────────
  useKeyboardShortcuts({
    onNewTask: useCallback(() => { setEditingTask(null); setModalVisible(true); }, [setEditingTask]),
    onSearch: useCallback(() => searchRef.current?.focus(), []),
    onToggleFocus: useCallback(() => setFocusMode(v => !v), [setFocusMode]),
    onCloseModal: useCallback(() => setModalVisible(false), []),
  });

  const openEditModal = useCallback((task) => {
    handleEditTask(task);
    setModalVisible(true);
  }, [handleEditTask]);

  const openNewTaskModal = useCallback(() => { setEditingTask(null); setModalVisible(true); }, [setEditingTask]);

  // ── Shared quadrant props ─────────────────────────────────────────
  const quadrantProps = {
    tasks, onComplete: handleCompleteTask, onDelete: handleDeleteTask,
    onEdit: openEditModal, onMove: handleMoveTask, activeFilter, searchQuery,
  };

  // ── Focus mode top bar text ───────────────────────────────────────
  const activeFocusHabit = habits.find(h => h.id === activeFocusHabitId);
  let topBarText = '';
  if (activeFocusHabit && activeTask) topBarText = `${activeTask.name} • ${activeFocusHabit.name}`;
  else if (activeFocusHabit) topBarText = activeFocusHabit.name;
  else if (activeTask) topBarText = activeTask.name;

  // ── Dynamic background ────────────────────────────────────────────
  const dynamicBg = { backgroundColor: theme.colors.background };
  const dynamicSurf = { backgroundColor: theme.colors.surface };

  return (
    <SafeAreaView style={[styles.container, dynamicBg, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
      <StatusBar barStyle={theme.id === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.colors.background} />

      {toastMessage && (
        <Animated.View style={[styles.toast, { transform: [{ translateY: toastAnim }] }]}>
           <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      <OnboardingTutorial visible={showOnboarding} onComplete={completeOnboarding} />

      <View style={[styles.rootContainer, isDesktop && { flexDirection: 'row' }]}>
        {isDesktop && <Navigation activeTab={activeTab} focusMode={focusMode} onChangeTab={handleTabChange} isDesktop={true} isNavLocked={isNavLocked} />}

        <View style={styles.contentContainer}>
          {/* Header */}
          {!focusMode && (
            <View style={[styles.header, dynamicSurf]}>
              <Text style={[styles.title, { color: theme.colors.text }]}>📋 Task Forge</Text>
              <View style={styles.headerRight}>
                <ShortcutHint />
              </View>
            </View>
          )}

          {activeTab === 'tasks' && !focusMode && <InsightsBar tasks={tasks} />}
          {activeTab === 'tasks' && !focusMode && <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />}

          {activeTab === 'tasks' && (
            <SearchBar
              value={searchQuery} onChangeText={setSearchQuery}
              focusMode={focusMode} onToggleFocus={() => setFocusMode(v => !v)}
              searchRef={searchRef} activeTaskName={topBarText}
            />
          )}

          {/* Main layout */}
          {focusMode ? (
            <ErrorBoundary label="Focus Mode">
            <View style={styles.focusBg}>
               <View style={[styles.focusGlowOrb, { backgroundColor: theme.colors.primary + '11', ...Platform.select({ web: { filter: 'blur(150px)' }, default: {} }) }]} />
               <View style={[styles.focusVignette, Platform.select({ web: { filter: 'blur(60px)' }, default: {} })]} pointerEvents="none" />
               {[...Array(8)].map((_, i) => (
                 <View key={i} style={[styles.focusParticle, { width: i % 2 === 0 ? 3 : 5, height: i % 2 === 0 ? 3 : 5, top: `${10 + i * 11}%`, left: `${15 + (i % 4) * 20}%` }]} pointerEvents="none" />
               ))}

                {isDesktop && (
                  <>
                    <View style={styles.focusStatsLeft}>
                       <Text style={styles.focusStatsLabel}>TODAY FOCUS</Text>
                       <Text style={styles.focusStatsValue}>{todayFocusStr}</Text>
                       <View style={styles.focusStatsSpacer} />
                       <Text style={styles.focusStatsLabel}>SESSIONS</Text>
                       <Text style={[styles.focusStatsValue, { color: theme.colors.primary }]}>{todaySessionsCount} completed</Text>
                    </View>
                    <View style={styles.focusStatsRight}>
                       <Text style={styles.focusStatsLabel}>CURRENT STREAK</Text>
                       <Text style={styles.focusStatsValue}>{currentStreak} Days</Text>
                       <View style={styles.focusStatsSpacer} />
                       <Text style={styles.focusStatsLabel}>BEST DAY</Text>
                       <Text style={[styles.focusStatsValue, { color: theme.colors.q2 }]}>{bestDayStr}</Text>
                    </View>
                  </>
               )}
               <PomodoroTimer
                 activeTask={activeTask}
                 habits={habits}
                 onHabitSelect={setActiveFocusHabitId}
                 onTimerStateChange={(running, reason, meta) => {
                    setTimerActive(running);
                    if (reason === 'completed') {
                       if (meta && !meta.isBreak) {
                          recordFocusSession(meta.durationSecs);
                          if (meta.selectedHabitId) {
                             autoCompleteHabit(meta.selectedHabitId);
                          }
                       }
                       showToast('Focus session completed. Great work.');
                    }
                 }}
               />
            </View>
            </ErrorBoundary>
          ) : activeTab === 'tasks' ? (
            <View style={[styles.mainLayout, isDesktop && styles.mainLayoutDesktop]}>
              <View style={[styles.matrix, isDesktop && styles.matrixDesktop]}>
                {isDesktop ? (
                  <>
                    <View style={styles.row}>
                      <TaskQuadrant categoryId={Q_URGENT_IMPORTANT} {...quadrantProps} />
                      <TaskQuadrant categoryId={Q_NOT_URGENT_IMPORTANT} {...quadrantProps} />
                    </View>
                    <View style={styles.row}>
                      <TaskQuadrant categoryId={Q_URGENT_NOT_IMPORTANT} {...quadrantProps} />
                      <TaskQuadrant categoryId={Q_NOT_URGENT_NOT_IMPORTANT} {...quadrantProps} />
                    </View>
                  </>
                ) : (
                  <View style={styles.mobileContainer}>
                    <View style={styles.mobileTabs}>
                      {[
                        { id: Q_URGENT_IMPORTANT, label: 'Urgent & Imp' },
                        { id: Q_NOT_URGENT_IMPORTANT, label: 'Not Urg & Imp' },
                        { id: Q_URGENT_NOT_IMPORTANT, label: 'Urgent & Not Imp' },
                        { id: Q_NOT_URGENT_NOT_IMPORTANT, label: 'Not Urg & Not Imp' },
                      ].map(t => (
                        <TouchableOpacity
                          key={t.id}
                          style={[styles.mobTabBtn, mobileTab === t.id && { borderBottomColor: theme.colors.primary }]}
                          onPress={() => setMobileTab(t.id)}
                        >
                          <Text style={[styles.mobTabText, { color: theme.colors.textSecondary }, mobileTab === t.id && { color: theme.colors.primary, fontWeight: 'bold' }]} numberOfLines={1}>
                            {t.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <View style={styles.mobActiveQ}>
                      <TaskQuadrant categoryId={mobileTab} {...quadrantProps} />
                    </View>
                  </View>
                )}
              </View>

              {isDesktop && !focusMode && (
                <RightPanel
                  tasks={tasks} habits={habits} logs={logs}
                  onComplete={handleCompleteTask} onDelete={handleDeleteTask}
                  onEdit={openEditModal} onToggleHabit={handleToggleHabit}
                  selectedDate={selectedDate} onSelectDate={setSelectedDate}
                />
              )}
            </View>
          ) : activeTab === 'habits' ? (
            <ErrorBoundary label="Habits">
              <HabitsView habits={habits} setHabits={setHabits} logs={logs} onToggleHabit={handleToggleHabit} />
            </ErrorBoundary>
          ) : activeTab === 'calendar' ? (
            <ErrorBoundary label="Agenda Planner">
              <View style={styles.flexOne}>
                <AgendaPlanner
                  tasks={tasks} habits={habits} logs={logs}
                  onComplete={handleCompleteTask} onDelete={handleDeleteTask}
                  onEdit={openEditModal} onToggleHabit={handleToggleHabit}
                  selectedDate={selectedDate} setSelectedDate={setSelectedDate}
                  isDesktop={isDesktop}
                />
              </View>
            </ErrorBoundary>
          ) : activeTab === 'stats' ? (
            <ErrorBoundary label="Stats">
              <StatsPanel tasks={tasks} habits={habits} logs={logs} />
            </ErrorBoundary>
          ) : activeTab === 'settings' ? (
            <ErrorBoundary label="Settings">
              <SettingsView
                tasks={tasks} habits={habits} logs={logs}
                prodSettings={prodSettings} setProdSettings={setProdSettings}
                onReplayTutorial={() => setShowOnboarding(true)}
              />
            </ErrorBoundary>
          ) : (
             <View style={styles.fallbackView}>
               <Text style={styles.fallbackText}>In Development</Text>
             </View>
          )}

          {/* FAB */}
          {activeTab === 'tasks' && !focusMode && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary }]}
          onPress={openNewTaskModal}
          activeOpacity={0.8}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}

          <DailyBriefingModal tasks={tasks} visible={showBriefing} onClose={() => setShowBriefing(false)} />

          <AddTaskModal
            visible={isModalVisible}
            onClose={() => setModalVisible(false)}
            onAdd={handleSaveTask}
            initialTask={editingTask}
            selectedDate={selectedDate}
          />
        </View>

          {!isDesktop && <Navigation activeTab={activeTab} focusMode={focusMode} onChangeTab={handleTabChange} isDesktop={false} isNavLocked={isNavLocked} />}
      </View>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root: wrap in ThemeProvider
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ErrorBoundary label="Task Forge">
      <ThemeProvider>
        <AppInner />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  rootContainer: { flex: 1 },
  contentContainer: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222230',
    zIndex: 50,
  },
  title: { fontSize: 18, fontWeight: 'bold', letterSpacing: 0.5 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  toast: {
    position: 'absolute', top: 0, left: 20, right: 20,
    backgroundColor: '#333', borderRadius: 10, padding: 14,
    zIndex: 9999, alignItems: 'center',
  },
  toastText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  fab: {
    position: 'absolute', right: 24, bottom: 32,
    width: 64, height: 64, borderRadius: 32,
    justifyContent: 'center', alignItems: 'center',
    elevation: 8, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6, shadowRadius: 12,
  },
  fabText: { color: '#000', fontSize: 36, fontWeight: '300', marginTop: -4 },
  mainLayout: { flex: 1 },
  mainLayoutDesktop: { flexDirection: 'row' },
  row: { flexDirection: 'row', flex: 1, gap: 8 },
  matrix: { flex: 1, padding: 4 },
  matrixDesktop: { flex: 2.5 },
  mobileContainer: { flex: 1 },
  mobileTabs: { flexDirection: 'row', marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#2A2A2A' },
  mobTabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  mobTabText: { fontSize: 10, textAlign: 'center' },
  mobActiveQ: { flex: 1 },
  flexOne: { flex: 1 },
  fallbackView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fallbackText: { color: '#9090A8' },
  focusBg: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#090909', overflow: 'hidden',
  },
  focusGlowOrb: {
    position: 'absolute', width: 800, height: 800,
    borderRadius: 400, zIndex: -1,
  },
  focusVignette: {
    position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
    borderWidth: 100, borderColor: 'rgba(0,0,0,0.15)', zIndex: -1,
  },
  focusParticle: {
    position: 'absolute', borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#FFF', shadowOpacity: 0.5, shadowRadius: 4,
  },
  focusStatsSpacer: { height: 16 },
  focusStatsLeft: {
    position: 'absolute', left: 40, top: '35%', width: 220,
    backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 24, padding: 32,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    ...Platform.select({ web: { backdropFilter: 'blur(10px)' }, default: {} }),
  },
  focusStatsRight: {
    position: 'absolute', right: 40, top: '35%', width: 220,
    backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 24, padding: 32,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    ...Platform.select({ web: { backdropFilter: 'blur(10px)' }, default: {} }),
  },
  focusStatsLabel: { color: '#888', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 },
  focusStatsValue: { color: '#FFF', fontSize: 26, fontWeight: '800' },
});
