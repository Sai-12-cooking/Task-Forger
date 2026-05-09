import { useState, useEffect, useCallback, useRef } from 'react';
import { Animated } from 'react-native';
import {
  loadOnboardingStatus, saveOnboardingStatus,
  loadProductivitySettings, saveProductivitySettings,
} from '../utils/storage';
import { Q_URGENT_IMPORTANT } from '../constants';

export function useAppNavigation(setFocusMode, timerActive) {
  const [activeTab, setActiveTab] = useState('tasks');
  const [mobileTab, setMobileTab] = useState(Q_URGENT_IMPORTANT);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);
  const [prodSettings, setProdSettings] = useState({ requireFocusLock: true });
  const [isNavLocked, setIsNavLocked] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const toastAnim = useRef(new Animated.Value(-100)).current;

  // ── Load on mount ─────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const didOnboard = await loadOnboardingStatus();
      const settings = await loadProductivitySettings();
      setProdSettings(settings);
      if (!didOnboard) setShowOnboarding(true);
    })();
  }, []);

  // ── Nav lock ──────────────────────────────────────────────────────
  useEffect(() => {
    setIsNavLocked(prodSettings.requireFocusLock && timerActive);
  }, [prodSettings.requireFocusLock, timerActive]);

  // ── Toast ─────────────────────────────────────────────────────────
  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    toastAnim.setValue(-100);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 50, duration: 300, useNativeDriver: true }),
      Animated.delay(3000),
      Animated.timing(toastAnim, { toValue: -100, duration: 300, useNativeDriver: true })
    ]).start(() => setToastMessage(null));
  }, [toastAnim]);

  // ── Tab change handler ────────────────────────────────────────────
  const handleTabChange = useCallback((tab) => {
    if (isNavLocked && tab !== 'focus') {
      showToast('Focus session active. Complete the timer or Exit Focus to navigate.');
      return;
    }
    if (tab === 'focus') {
      setActiveTab('tasks');
      setFocusMode(true);
    } else {
      setActiveTab(tab);
      setFocusMode(false);
    }
  }, [isNavLocked, showToast, setFocusMode]);

  // ── Onboarding complete ───────────────────────────────────────────
  const completeOnboarding = useCallback(() => {
    setShowOnboarding(false);
    saveOnboardingStatus(true);
  }, []);

  return {
    activeTab,
    setActiveTab,
    mobileTab,
    setMobileTab,
    showOnboarding,
    setShowOnboarding,
    showBriefing,
    setShowBriefing,
    prodSettings,
    setProdSettings,
    isNavLocked,
    toastMessage,
    toastAnim,
    showToast,
    handleTabChange,
    completeOnboarding,
  };
}
