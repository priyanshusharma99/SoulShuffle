import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { fetchRoomHistory, getActiveRoom, SentChallenge } from '@/services/roomService';
import { getMyProfileCached } from '@/services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GameSocket from '@/services/socketService';
import { useSidebar } from '@/context/SidebarContext';
import { useUserAvatar } from '@/hooks/use-user-avatar';
import * as Haptics from 'expo-haptics';

type FilterType = 'ALL' | 'SENT_BY_ME' | 'RECEIVED' | 'SAVED';

interface RoomGroup {
  roomId: string;
  roomCode: string;
  roomStatus: string;
  partnerName: string;
  partnerAvatar?: string | null;
  dateGroups: {
    dateLabel: string;
    items: SentChallenge[];
  }[];
}

interface ChallengeStatusDetail {
  statusText: string;
  statusIcon: keyof typeof Ionicons.glyphMap;
  statusColor: string;
  statusBg: string;
  bannerBg: string;
  bannerBorderColor: string;
  accentColor: string;
  headline: string;
  subtext: string;
  actionLabel?: string;
  isCompleted: boolean;
  isIncomplete: boolean;
}

export default function History() {
  const { openSidebar } = useSidebar();
  const userAvatar = useUserAvatar();
  const router = useRouter();

  const [challengeHistory, setChallengeHistory] = useState<SentChallenge[]>([]);
  const [stats, setStats] = useState({ completionRate: 0, currentStreak: 0, daresMastered: 0, totalCards: 0 });
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [expandedCategory, setExpandedCategory] = useState<FilterType | null>(null);
  const [savedDareIds, setSavedDareIds] = useState<string[]>([]);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeRoomInfo, setActiveRoomInfo] = useState<{
    id: string;
    code: string;
    partnerName: string;
    partnerAvatar: string | null;
    status: string;
  } | null>(null);

  // Load saved dare IDs from local storage
  useEffect(() => {
    const loadSavedDares = async () => {
      try {
        const stored = await AsyncStorage.getItem('saved_dare_ids');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setSavedDareIds(parsed);
          }
        }
      } catch (e) {
        console.log('Error reading saved_dare_ids:', e);
      }
    };
    loadSavedDares();
  }, []);

  const toggleSaveDare = async (challengeId: string) => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      const strId = String(challengeId);
      const updated = savedDareIds.includes(strId)
        ? savedDareIds.filter((id) => id !== strId)
        : [...savedDareIds, strId];
      setSavedDareIds(updated);
      await AsyncStorage.setItem('saved_dare_ids', JSON.stringify(updated));
    } catch (e) {
      console.log('Error toggling saved dare:', e);
    }
  };

  // Safe Date parser that handles ISO strings, SQL timestamps, and Unix timestamps
  const parseDateSafely = (dateStr?: any): Date | null => {
    if (!dateStr) return null;
    if (dateStr instanceof Date) return isNaN(dateStr.getTime()) ? null : dateStr;
    if (typeof dateStr === 'number') {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? null : d;
    }
    if (typeof dateStr === 'string') {
      const trimmed = dateStr.trim();
      if (!trimmed) return null;

      // 1. Direct parse
      let d = new Date(trimmed);
      if (!isNaN(d.getTime())) return d;

      // 2. Fix SQL timestamp format "YYYY-MM-DD HH:mm:ss" -> "YYYY-MM-DDTHH:mm:ss"
      const iso = trimmed.replace(' ', 'T');
      d = new Date(iso);
      if (!isNaN(d.getTime())) return d;

      // 3. Append 'Z' if missing timezone offset
      if (!iso.endsWith('Z') && !iso.includes('+') && !/[-+]\d{2}:\d{2}$/.test(iso)) {
        d = new Date(iso + 'Z');
        if (!isNaN(d.getTime())) return d;
      }
    }
    return null;
  };

  // Format exact time for individual cards in the user's local device timezone
  const formatCardTime = (challenge: SentChallenge): string => {
    const rawDateStr = challenge.sent_at || (challenge as any).created_at;
    const parsedDate = parseDateSafely(rawDateStr);
    if (parsedDate) {
      return parsedDate.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }

    if (challenge.time && typeof challenge.time === 'string') {
      const isDuration = /min|hour|sec/i.test(challenge.time);
      if (!isDuration) {
        const parsedTime = parseDateSafely(challenge.time);
        if (parsedTime) {
          return parsedTime.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          });
        }
        return challenge.time;
      }
    }

    return 'Recently';
  };

  // Format date helper for WhatsApp-like date pills
  const getDateLabel = (dateStr?: string) => {
    const date = parseDateSafely(dateStr);
    if (!date) return 'Recent';

    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  };

  const calculateStats = (currentRoomHistory: SentChallenge[], staticTotal: number = 0) => {
    const daresMastered = currentRoomHistory.filter((c) => {
      const s = (c.status || '').toUpperCase();
      return s === 'COMPLETED' || s === 'CONFIRMED' || s === 'COMPLETED_BY_RECEIVER';
    }).length;

    const total = staticTotal > 0 ? staticTotal : currentRoomHistory.length;
    let completionRate = total > 0 ? Math.round((daresMastered / total) * 100) : 0;
    if (completionRate > 100) completionRate = 100;

    let currentStreak = 0;
    if (currentRoomHistory.length > 0) {
      const dates = currentRoomHistory
        .map((c) => parseDateSafely(c.sent_at || (c as any).created_at))
        .filter((d): d is Date => d !== null)
        .map((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime())
        .sort((a, b) => b - a);

      const uniqueDates = [...new Set(dates)];
      const today = new Date().setHours(0, 0, 0, 0);
      const yesterday = today - 86400000;

      if (uniqueDates.length > 0 && (uniqueDates[0] === today || uniqueDates[0] === yesterday)) {
        currentStreak = 1;
        for (let i = 0; i < uniqueDates.length - 1; i++) {
          if (uniqueDates[i] - uniqueDates[i + 1] === 86400000) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    setStats({ completionRate, currentStreak, daresMastered, totalCards: total });
  };

  const loadHistory = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      // 1. Get current user ID
      const profile = await getMyProfileCached();
      const currentUserId = profile?.id || null;
      if (currentUserId) {
        setMyUserId(currentUserId);
      }

      // 2. Resolve Active Room ID first
      let activeRoom: any = null;
      try {
        activeRoom = await getActiveRoom();
      } catch (e) {
        // network or 404
      }

      if (!activeRoom) {
        try {
          const cachedRoomRaw = await AsyncStorage.getItem('cachedActiveRoom');
          if (cachedRoomRaw) {
            activeRoom = JSON.parse(cachedRoomRaw);
          }
        } catch (e) {}
      }

      const activeRoomId = activeRoom?.id || null;

      if (!activeRoomId) {
        setChallengeHistory([]);
        setActiveRoomInfo(null);
        setStats({ completionRate: 0, currentStreak: 0, daresMastered: 0, totalCards: 0 });
        setLoading(false);
        if (showRefreshing) setRefreshing(false);
        return;
      }

      const isHost = activeRoom.host_id === currentUserId;
      const partnerName = isHost
        ? (activeRoom.partner_name || activeRoom.partner?.first_name || activeRoom.partner?.full_name || 'Partner')
        : (activeRoom.host_name || activeRoom.host?.first_name || activeRoom.host?.full_name || 'Partner');
      const partnerAvatar = isHost
        ? (activeRoom.partner_avatar || activeRoom.partner?.avatar_url)
        : (activeRoom.host_avatar || activeRoom.host?.avatar_url);

      const storedPartnerName = await AsyncStorage.getItem(`partnerName_${activeRoomId}`);
      const resolvedPartnerName = storedPartnerName || partnerName || 'Partner';

      const currentRoomData = {
        id: activeRoomId,
        code: activeRoom.code || 'GAME',
        partnerName: resolvedPartnerName,
        partnerAvatar: partnerAvatar || null,
        status: activeRoom.status || 'ACTIVE',
      };

      setActiveRoomInfo(currentRoomData);

      const cacheKey = `cached_active_room_history_${activeRoomId}`;

      // Resolve Static Deck Total
      let staticTotal = 0;
      const staticTotalKey = `cached_static_total_${activeRoomId}`;
      try {
        const storedTotal = await AsyncStorage.getItem(staticTotalKey);
        if (storedTotal && parseInt(storedTotal, 10) > 0) {
          staticTotal = parseInt(storedTotal, 10);
        } else {
          const { fetchUserDeck } = require('@/services/cardService');
          const cards = await fetchUserDeck();
          staticTotal = cards?.length || 0;
          if (staticTotal > 0) {
            await AsyncStorage.setItem(staticTotalKey, staticTotal.toString());
          }
        }
      } catch (e) {
        console.log('Error resolving static total', e);
      }

      const enrichItem = (item: SentChallenge): SentChallenge => {
        return {
          ...item,
          room_id: activeRoomId,
          room_code:
            !item.room_code || item.room_code === 'GAME' || item.room_code === 'ROOM'
              ? currentRoomData.code
              : item.room_code,
          partner_name:
            !item.partner_name || item.partner_name === 'Partner'
              ? currentRoomData.partnerName
              : item.partner_name,
          partner_avatar: !item.partner_avatar ? currentRoomData.partnerAvatar : item.partner_avatar,
          room_status: currentRoomData.status,
        };
      };

      // Read instant cache
      if (!showRefreshing) {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed)) {
              const enriched = parsed.map(enrichItem);
              setChallengeHistory(enriched);
              calculateStats(enriched, staticTotal);
            }
          } catch (e) {
            console.log('Cache parse error:', e);
          }
        }
      }

      // Fetch fresh history
      let freshHistory: SentChallenge[] = [];
      let fetchFailed = false;
      try {
        freshHistory = await fetchRoomHistory(activeRoomId);
      } catch (err) {
        console.log('Fetch room history API error:', err);
        fetchFailed = true;
      }

      if (!Array.isArray(freshHistory) || freshHistory.length === 0) {
        if (activeRoom?.game_state?.challenge_history) {
          freshHistory = activeRoom.game_state.challenge_history.map((item: SentChallenge) => ({
            ...item,
            room_id: activeRoomId,
            room_code: currentRoomData.code,
            room_status: currentRoomData.status,
            partner_name: currentRoomData.partnerName,
            partner_avatar: currentRoomData.partnerAvatar,
          }));
        }
      }

      const currentRoomOnly = Array.isArray(freshHistory)
        ? freshHistory.filter((item) => !item.room_id || item.room_id === activeRoomId)
        : [];

      const enriched = currentRoomOnly.map(enrichItem);

      setChallengeHistory((prevHistory) => {
        if (fetchFailed && prevHistory && prevHistory.length > 0) {
          return prevHistory;
        }
        calculateStats(enriched, staticTotal);
        return enriched;
      });

      if (enriched.length > 0 && !fetchFailed) {
        await AsyncStorage.setItem(cacheKey, JSON.stringify(enriched));
      }
    } catch (error) {
      console.log('Failed to load history for active room:', error);
    } finally {
      if (showRefreshing) setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();

    const handleEvent = () => loadHistory(false);
    GameSocket.on('game_event', handleEvent);
    GameSocket.on('partner_joined', handleEvent);

    return () => {
      GameSocket.off('game_event', handleEvent);
      GameSocket.off('partner_joined', handleEvent);
    };
  }, [loadHistory]);

  // Counts for Category Cards
  const allDaresCount = challengeHistory.length;

  const sentByYouCount = useMemo(() => {
    return challengeHistory.filter((item) => {
      return item.is_sent_by_me ?? (myUserId ? item.sender_id === myUserId : true);
    }).length;
  }, [challengeHistory, myUserId]);

  const receivedCount = useMemo(() => {
    return challengeHistory.filter((item) => {
      return !(item.is_sent_by_me ?? (myUserId ? item.sender_id === myUserId : true));
    }).length;
  }, [challengeHistory, myUserId]);

  const savedDaresCount = useMemo(() => {
    return challengeHistory.filter((item) => {
      return savedDareIds.includes(String(item.id));
    }).length;
  }, [challengeHistory, savedDareIds]);

  // Filtered History
  const filteredHistory = useMemo(() => {
    return challengeHistory.filter((item) => {
      const isSentByMe = item.is_sent_by_me ?? (myUserId ? item.sender_id === myUserId : true);
      const isSaved = savedDareIds.includes(String(item.id));

      if (activeFilter === 'SENT_BY_ME') return isSentByMe;
      if (activeFilter === 'RECEIVED') return !isSentByMe;
      if (activeFilter === 'SAVED') return isSaved;
      return true; // 'ALL'
    });
  }, [challengeHistory, activeFilter, myUserId, savedDareIds]);

  // Group by Room Session, then Date
  const roomGroups = useMemo<RoomGroup[]>(() => {
    const groupsMap = new Map<
      string,
      {
        roomId: string;
        roomCode: string;
        roomStatus: string;
        partnerName: string;
        partnerAvatar?: string | null;
        items: SentChallenge[];
      }
    >();

    filteredHistory.forEach((item) => {
      const roomId = item.room_id || 'active_session';
      const roomCode = item.room_code || 'ROOM';
      const roomStatus = item.room_status || 'ACTIVE';
      const partnerName =
        item.partner_name || (item.is_sent_by_me ? item.receiver_name || 'Partner' : item.sender_name || 'Partner');
      const partnerAvatar =
        item.partner_avatar || (item.is_sent_by_me ? item.receiver_avatar : item.sender_avatar) || null;

      if (!groupsMap.has(roomId)) {
        groupsMap.set(roomId, {
          roomId,
          roomCode,
          roomStatus,
          partnerName,
          partnerAvatar,
          items: [],
        });
      }

      groupsMap.get(roomId)!.items.push(item);
    });

    const result: RoomGroup[] = [];

    groupsMap.forEach((group) => {
      const dateMap = new Map<string, SentChallenge[]>();
      group.items.forEach((item) => {
        const dateKey = getDateLabel(item.sent_at);
        if (!dateMap.has(dateKey)) {
          dateMap.set(dateKey, []);
        }
        dateMap.get(dateKey)!.push(item);
      });

      const dateGroups = Array.from(dateMap.entries()).map(([dateLabel, items]) => ({
        dateLabel,
        items,
      }));

      result.push({
        roomId: group.roomId,
        roomCode: group.roomCode,
        roomStatus: group.roomStatus,
        partnerName: group.partnerName,
        partnerAvatar: group.partnerAvatar,
        dateGroups,
      });
    });

    return result;
  }, [filteredHistory]);

  const getChallengeStatusDetail = (
    challenge: SentChallenge,
    userId: string | null,
    partnerName: string = 'Partner'
  ): ChallengeStatusDetail => {
    const rawStatus = (challenge.status || 'SENT').toUpperCase();
    const isSender = challenge.is_sent_by_me ?? (challenge.sender_id ? challenge.sender_id === userId : true);

    // Case 1: Fully Completed & Confirmed
    if (rawStatus === 'COMPLETED' || rawStatus === 'CONFIRMED') {
      return {
        headline: isSender
          ? 'Card Completed • Dare Mastered 🎉'
          : 'Card Completed • You Mastered This Dare! 🎉',
        subtext: isSender
          ? `${partnerName} finished this dare and it was confirmed.`
          : `You completed this dare and ${partnerName} confirmed it.`,
        statusText: isSender ? 'Completed' : 'Mastered',
        actionLabel: isSender ? 'Dare Mastered' : 'Dare Won',
        statusIcon: 'checkmark-circle',
        statusColor: '#2dd4bf',
        statusBg: 'rgba(45,212,191,0.18)',
        bannerBg: 'rgba(45,212,191,0.08)',
        bannerBorderColor: 'rgba(45,212,191,0.22)',
        accentColor: '#10b981',
        isCompleted: true,
        isIncomplete: false,
      };
    }

    // Case 2: Completed by Receiver, awaiting Sender's Confirmation
    if (rawStatus === 'COMPLETED_BY_RECEIVER') {
      return {
        headline: isSender
          ? 'Card is sent • Completed by partner, awaiting your confirmation'
          : "Card is done • You finished, awaiting partner's confirmation",
        subtext: isSender
          ? `${partnerName} finished this dare. Please confirm it in your active game session.`
          : `You completed this dare. Waiting for ${partnerName} to review & confirm.`,
        statusText: isSender ? 'Needs Confirm' : 'Under Review',
        actionLabel: isSender ? 'Action Required' : 'Awaiting Review',
        statusIcon: 'checkbox',
        statusColor: '#c084fc',
        statusBg: 'rgba(192,132,252,0.18)',
        bannerBg: 'rgba(192,132,252,0.08)',
        bannerBorderColor: 'rgba(192,132,252,0.22)',
        accentColor: '#a855f7',
        isCompleted: false,
        isIncomplete: true,
      };
    }

    // Case 3: Accepted and In Progress
    if (rawStatus === 'ACCEPTED' || rawStatus === 'ACTIVE' || rawStatus === 'IN_PROGRESS') {
      return {
        headline: isSender
          ? 'Card is sent • Accepted by partner, not complete yet'
          : 'Card received • You accepted, not complete yet',
        subtext: isSender
          ? `${partnerName} accepted your dare and is currently completing the challenge.`
          : `You accepted this dare from ${partnerName}. Complete it in the dashboard to finish!`,
        statusText: 'In Progress',
        actionLabel: isSender ? 'Partner in Action' : 'Your Turn to Play',
        statusIcon: 'flame',
        statusColor: '#fb7185',
        statusBg: 'rgba(251,113,133,0.18)',
        bannerBg: 'rgba(251,113,133,0.08)',
        bannerBorderColor: 'rgba(251,113,133,0.22)',
        accentColor: '#f43f5e',
        isCompleted: false,
        isIncomplete: true,
      };
    }

    // Case 4: Deflected with Shield
    if (rawStatus === 'DEFLECTED') {
      return {
        headline: isSender
          ? 'Card is sent • Deflected by partner (Not completed)'
          : 'Card received • Deflected with your Shield card',
        subtext: isSender
          ? `${partnerName} used a Deflect Shield card to safely skip this dare.`
          : 'You blocked this dare using a Deflect Shield card.',
        statusText: 'Deflected',
        actionLabel: isSender ? 'Shield Used' : 'Shielded',
        statusIcon: 'shield-checkmark',
        statusColor: '#818cf8',
        statusBg: 'rgba(129,140,248,0.18)',
        bannerBg: 'rgba(129,140,248,0.08)',
        bannerBorderColor: 'rgba(129,140,248,0.22)',
        accentColor: '#6366f1',
        isCompleted: false,
        isIncomplete: false,
      };
    }

    // Case 5: Rejected / Declined
    if (rawStatus === 'REJECTED' || rawStatus === 'DECLINED') {
      const penaltyLog =
        (challenge as any).penalty_log && (challenge as any).penalty_log.length > 0
          ? (challenge as any).penalty_log[0]
          : null;
      const transferredCardName = penaltyLog?.user_card_deck?.cards?.name;

      let newSubtext = isSender
        ? `${partnerName} chose not to accept this dare.`
        : `You chose to decline this dare from ${partnerName}.`;

      if (transferredCardName) {
        newSubtext = isSender
          ? `${partnerName} declined this dare. You received "${transferredCardName}" as compensation!`
          : `You declined this dare. Your "${transferredCardName}" was transferred to ${partnerName} as a penalty.`;
      }

      return {
        headline: isSender
          ? transferredCardName
            ? 'Card is sent • Declined by partner (Penalty Applied)'
            : 'Card is sent • Declined by partner (Not completed)'
          : transferredCardName
          ? 'Card received • You declined this dare (Penalty Applied)'
          : 'Card received • You declined this dare',
        subtext: newSubtext,
        statusText: 'Declined',
        actionLabel: isSender ? 'Passed' : 'Declined by You',
        statusIcon: 'close-circle',
        statusColor: '#f87171',
        statusBg: 'rgba(248,113,113,0.18)',
        bannerBg: 'rgba(248,113,113,0.08)',
        bannerBorderColor: 'rgba(248,113,113,0.22)',
        accentColor: '#ef4444',
        isCompleted: false,
        isIncomplete: false,
      };
    }

    // Case 6: Expired / Penalty
    if (rawStatus === 'EXPIRED' || rawStatus === 'PENALTY') {
      return {
        headline: isSender
          ? 'Card is sent • Expired before completion'
          : 'Card received • Expired before completion',
        subtext: isSender
          ? 'The time window or session ended before this dare was fulfilled.'
          : 'Time limit passed before this dare was completed.',
        statusText: 'Expired',
        actionLabel: 'Time Expired',
        statusIcon: 'time-outline',
        statusColor: '#94a3b8',
        statusBg: 'rgba(148,163,184,0.18)',
        bannerBg: 'rgba(148,163,184,0.08)',
        bannerBorderColor: 'rgba(148,163,184,0.22)',
        accentColor: '#94a3b8',
        isCompleted: false,
        isIncomplete: false,
      };
    }

    // Case 7: Default / Sent (Pending)
    return {
      headline: isSender
        ? 'Card is sent • Not complete yet (Awaiting acceptance)'
        : 'New Card received • Not complete yet (Awaiting your action)',
      subtext: isSender
        ? `You sent this dare to ${partnerName}. Waiting for them to accept the challenge.`
        : `${partnerName} challenged you! Head to Dashboard to accept and play.`,
      statusText: isSender ? 'Sent (Pending)' : 'Action Required',
      actionLabel: isSender ? 'Awaiting Partner' : 'Awaiting You',
      statusIcon: isSender ? 'paper-plane' : 'alert-circle',
      statusColor: isSender ? '#38bdf8' : '#fbbf24',
      statusBg: isSender ? 'rgba(56,189,248,0.18)' : 'rgba(251,191,36,0.18)',
      bannerBg: isSender ? 'rgba(56,189,248,0.08)' : 'rgba(251,191,36,0.08)',
      bannerBorderColor: isSender ? 'rgba(56,189,248,0.22)' : 'rgba(251,191,36,0.22)',
      accentColor: isSender ? '#0284c7' : '#f59e0b',
      isCompleted: false,
      isIncomplete: true,
    };
  };

  const filterPills: { label: string; value: FilterType; icon: keyof typeof Ionicons.glyphMap }[] = [
    { label: 'All Dares', value: 'ALL', icon: 'layers' },
    { label: 'Sent by You', value: 'SENT_BY_ME', icon: 'paper-plane' },
    { label: 'Received', value: 'RECEIVED', icon: 'download-outline' },
    { label: 'Saved Dares', value: 'SAVED', icon: 'bookmark-outline' },
  ];

  const categoryCards: {
    id: FilterType;
    title: string;
    count: number;
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    iconBg: string;
  }[] = [
    {
      id: 'ALL',
      title: 'All Dares',
      count: allDaresCount,
      icon: 'layers',
      iconColor: '#FF3366',
      iconBg: '#2E1220',
    },
    {
      id: 'SENT_BY_ME',
      title: 'Sent by You',
      count: sentByYouCount,
      icon: 'paper-plane',
      iconColor: '#C084FC',
      iconBg: '#25142B',
    },
    {
      id: 'RECEIVED',
      title: 'Received',
      count: receivedCount,
      icon: 'download',
      iconColor: '#38BDF8',
      iconBg: '#141E2D',
    },
    {
      id: 'SAVED',
      title: 'Saved Dares',
      count: savedDaresCount,
      icon: 'bookmark',
      iconColor: '#FB923C',
      iconBg: '#2D1E13',
    },
  ];

  const handleCategoryPress = (categoryId: FilterType) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setActiveFilter(categoryId);
    // Toggle accordion expansion: if tapping the already-open category, collapse it; else open it
    setExpandedCategory((prev) => (prev === categoryId ? null : categoryId));
  };

  const handlePillPress = (filterValue: FilterType) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setActiveFilter(filterValue);
    setExpandedCategory(filterValue);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0B0507]" edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0507" />

      {/* ── TOP APP BAR ── */}
      <View className="flex-row items-center justify-between px-5 pt-3 pb-3 bg-[#0B0507] z-10">
        <TouchableOpacity onPress={openSidebar} activeOpacity={0.7} className="p-1">
          <Ionicons name="menu" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <View className="flex-row items-center gap-2">
          <Ionicons name="hourglass" size={22} color="#FF3366" />
          <Text className="text-[#FF3366] font-extrabold text-[20px] tracking-tight">Game Journey</Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/profile')}
          activeOpacity={0.7}
          className="w-9 h-9 rounded-full bg-[#251222] items-center justify-center border border-[#3E1A33] overflow-hidden"
        >
          <Image
            source={{
              uri:
                userAvatar ||
                'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Crystal%20ball/3D/crystal_ball_3d.png',
            }}
            className="w-7 h-7"
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 160, paddingTop: 6 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadHistory(true)}
            tintColor="#FF2A5F"
            colors={['#FF2A5F', '#FF6B35']}
          />
        }
      >
        {/* ── TITLE SECTION ── */}
        <View className="mt-3 mb-5">
          <Text className="text-[11px] font-bold text-[#FF4B72] tracking-[0.2em] uppercase mb-1.5">
            CURRENT GAME STATS
          </Text>
          <Text className="text-[34px] leading-[40px] font-black text-white tracking-tight">
            Our <Text className="italic text-[#FF3366]">Moments</Text>
            {'\n'}& Dares
          </Text>
        </View>

        {/* ── STATS CARDS ROW ── */}
        <View className="flex-row gap-3 mb-6">
          {/* 1. Completion */}
          <View className="flex-1 bg-[#160B10] rounded-[22px] p-3.5 border border-[#26131D] justify-between">
            <View className="w-8 h-8 rounded-full bg-[#2E1220] items-center justify-center mb-2.5">
              <Ionicons name="radio-button-on" size={16} color="#FF3366" />
            </View>
            <Text className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">Completion</Text>
            <Text className="text-[24px] font-black text-white tracking-tight">{stats.completionRate}%</Text>
            <View className="w-full h-1.5 bg-[#26131D] rounded-full mt-2.5 overflow-hidden">
              <View
                className="h-full bg-[#FF3366] rounded-full"
                style={{ width: `${Math.min(100, Math.max(0, stats.completionRate))}%` }}
              />
            </View>
          </View>

          {/* 2. Active Streak */}
          <View className="flex-1 bg-[#160B10] rounded-[22px] p-3.5 border border-[#26131D] justify-between">
            <View className="w-8 h-8 rounded-full bg-[#2E1612] items-center justify-center mb-2.5">
              <Ionicons name="flame" size={17} color="#FF6B35" />
            </View>
            <Text className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">Active Streak</Text>
            <View className="flex-row items-baseline gap-1">
              <Text className="text-[24px] font-black text-white tracking-tight">{stats.currentStreak}</Text>
              <Text className="text-[12px] font-medium text-[#9CA3AF]">Days</Text>
            </View>
            <View className="flex-row items-center gap-1 mt-2.5">
              {[...Array(6)].map((_, i) => (
                <View
                  key={i}
                  style={{
                    flex: 1,
                    height: 4,
                    borderRadius: 999,
                    backgroundColor: i < Math.min(stats.currentStreak, 6) ? '#FF6B35' : '#26131D',
                  }}
                />
              ))}
            </View>
          </View>

          {/* 3. Dares Won */}
          <View className="flex-1 bg-[#160B10] rounded-[22px] p-3.5 border border-[#26131D] justify-between">
            <View className="w-8 h-8 rounded-full bg-[#291228] items-center justify-center mb-2.5">
              <Ionicons name="trophy" size={16} color="#E879F9" />
            </View>
            <Text className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">Dares Won</Text>
            <Text className="text-[24px] font-black text-white tracking-tight">{stats.daresMastered}</Text>
            <View className="h-1 mt-2.5" />
          </View>
        </View>

        {/* ── HORIZONTAL FILTER PILLS ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-5"
          contentContainerStyle={{ gap: 10, paddingHorizontal: 2 }}
        >
          {filterPills.map((pill) => {
            const isActive = activeFilter === pill.value;
            return (
              <TouchableOpacity
                key={pill.value}
                onPress={() => handlePillPress(pill.value)}
                activeOpacity={0.8}
                className="flex-row items-center gap-2 px-4 py-2.5 rounded-full"
                style={{
                  backgroundColor: isActive ? '#FF2A5F' : '#160B10',
                  borderWidth: 1,
                  borderColor: isActive ? '#FF2A5F' : '#26131D',
                }}
              >
                <Ionicons
                  name={pill.icon}
                  size={15}
                  color={isActive ? '#FFFFFF' : '#9CA3AF'}
                />
                <Text
                  style={{
                    color: isActive ? '#FFFFFF' : '#D4D4D8',
                    fontWeight: isActive ? '700' : '600',
                    fontSize: 12.5,
                  }}
                >
                  {pill.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── FOUR CATEGORY OVERVIEW CARDS ── */}
        <View className="mb-4">
          {categoryCards.map((card) => {
            const isSelected = activeFilter === card.id;
            const isCardExpanded = expandedCategory === card.id && filteredHistory.length > 0;

            return (
              <View key={card.id} className="mb-3">
                <TouchableOpacity
                  onPress={() => handleCategoryPress(card.id)}
                  activeOpacity={0.8}
                  className="flex-row items-center justify-between p-3.5 rounded-[22px] bg-[#160B10] border"
                  style={{
                    borderColor: isSelected ? '#FF2A5F' : '#26131D',
                  }}
                >
                  <View className="flex-row items-center gap-3.5">
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center"
                      style={{ backgroundColor: card.iconBg }}
                    >
                      <Ionicons name={card.icon} size={20} color={card.iconColor} />
                    </View>
                    <Text className="text-white text-[16px] font-bold tracking-tight">
                      {card.title}
                    </Text>
                  </View>

                  <View className="flex-row items-center gap-2">
                    <Text
                      className="text-[16px] font-bold"
                      style={{ color: isSelected ? '#FFFFFF' : '#9CA3AF' }}
                    >
                      {card.count}
                    </Text>
                    <Ionicons
                      name={isCardExpanded ? 'chevron-down' : 'chevron-forward'}
                      size={18}
                      color={isSelected ? '#FF2A5F' : '#9CA3AF'}
                    />
                  </View>
                </TouchableOpacity>

                {/* ── EXPANDED DARES TIMELINE (ACCORDION PER CATEGORY) ── */}
                {isCardExpanded && (
                  <View className="mt-3 pl-1 pr-1">
                    {roomGroups.map((roomGroup) => {
                      const isActiveRoom = roomGroup.roomStatus === 'ACTIVE' || roomGroup.roomStatus === 'WAITING';

                      return (
                        <View key={roomGroup.roomId} className="mb-4">
                          {/* Room Header Banner */}
                          <View
                            className="rounded-2xl p-3 mb-3 flex-row items-center justify-between border border-[#26131D]"
                            style={{ backgroundColor: '#1A0E13' }}
                          >
                            <View className="flex-row items-center gap-2.5">
                              <View className="w-8 h-8 rounded-full bg-[#2E1220] items-center justify-center">
                                <Ionicons name="game-controller" size={15} color="#FF3366" />
                              </View>
                              <View>
                                <View className="flex-row items-center gap-2">
                                  <Text className="text-xs font-black tracking-wider text-white uppercase">
                                    Room #{roomGroup.roomCode}
                                  </Text>
                                  <View
                                    className="px-2 py-0.5 rounded-full"
                                    style={{
                                      backgroundColor: isActiveRoom
                                        ? 'rgba(16,185,129,0.15)'
                                        : 'rgba(100,116,139,0.15)',
                                    }}
                                  >
                                    <Text
                                      className="text-[9px] font-bold uppercase tracking-wider"
                                      style={{ color: isActiveRoom ? '#10b981' : '#64748b' }}
                                    >
                                      {isActiveRoom ? '🟢 Active' : '⚪ Ended'}
                                    </Text>
                                  </View>
                                </View>
                                <Text className="text-[11px] text-[#9CA3AF] font-medium">
                                  Partner: <Text className="font-bold text-[#FF3366]">{roomGroup.partnerName}</Text>
                                </Text>
                              </View>
                            </View>
                          </View>

                          {/* Date Groups inside Room */}
                          {roomGroup.dateGroups.map((dateGroup) => (
                            <View key={dateGroup.dateLabel} className="mb-3">
                              {/* Date Bubble */}
                              <View className="items-center my-2">
                                <View className="px-3 py-1 rounded-full border border-[#26131D] bg-[#160B10]">
                                  <Text className="text-[10px] font-bold tracking-wider uppercase text-[#FF4B72]">
                                    {dateGroup.dateLabel}
                                  </Text>
                                </View>
                              </View>

                              {/* Challenge Cards for this Date */}
                              {dateGroup.items.map((challenge, idx) => {
                                const isSentByMe =
                                  challenge.is_sent_by_me ?? (myUserId ? challenge.sender_id === myUserId : true);
                                const statusDetail = getChallengeStatusDetail(
                                  challenge,
                                  myUserId,
                                  roomGroup.partnerName
                                );
                                const isExpired = (challenge.status || '').toUpperCase() === 'EXPIRED';
                                const isSaved = savedDareIds.includes(String(challenge.id));

                                return (
                                  <View
                                    key={`${challenge.id}-${idx}`}
                                    className="mb-3.5 rounded-[22px] overflow-hidden border border-[#26131D] bg-[#160B10]"
                                    style={{
                                      shadowColor: '#000',
                                      shadowOffset: { width: 0, height: 3 },
                                      shadowOpacity: 0.35,
                                      shadowRadius: 6,
                                      elevation: 3,
                                      opacity: isExpired ? 0.75 : 1,
                                    }}
                                  >
                                    {/* ── Status Banner ── */}
                                    <View
                                      style={{
                                        backgroundColor: statusDetail.bannerBg,
                                        borderBottomWidth: 1,
                                        borderBottomColor: statusDetail.bannerBorderColor,
                                        borderLeftWidth: 4,
                                        borderLeftColor: statusDetail.accentColor,
                                        paddingHorizontal: 14,
                                        paddingVertical: 10,
                                      }}
                                    >
                                      <View className="flex-row items-center justify-between">
                                        <View className="flex-row items-center gap-2 flex-1 mr-2">
                                          <View
                                            style={{
                                              width: 24,
                                              height: 24,
                                              borderRadius: 12,
                                              backgroundColor: statusDetail.statusBg,
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                            }}
                                          >
                                            <Ionicons
                                              name={statusDetail.statusIcon}
                                              size={13}
                                              color={statusDetail.statusColor}
                                            />
                                          </View>
                                          <Text
                                            style={{
                                              color: '#FFFFFF',
                                              fontWeight: '800',
                                              fontSize: 12.5,
                                              letterSpacing: -0.2,
                                              flexShrink: 1,
                                            }}
                                            numberOfLines={1}
                                          >
                                            {statusDetail.headline}
                                          </Text>
                                        </View>

                                        <View
                                          className="flex-row items-center gap-1 px-2.5 py-0.5 rounded-full"
                                          style={{ backgroundColor: statusDetail.statusBg }}
                                        >
                                          <Text
                                            className="text-[9px] font-black uppercase tracking-wider"
                                            style={{ color: statusDetail.statusColor }}
                                          >
                                            {statusDetail.statusText}
                                          </Text>
                                        </View>
                                      </View>

                                      <Text
                                        style={{
                                          color: '#CBD5E1',
                                          fontSize: 11,
                                          fontWeight: '500',
                                          lineHeight: 16,
                                          marginTop: 4,
                                          marginLeft: 32,
                                        }}
                                      >
                                        {statusDetail.subtext}
                                      </Text>
                                    </View>

                                    {/* ── Direction & Attribution Sub-bar ── */}
                                    <View
                                      className="px-4 py-1.5 flex-row items-center justify-between border-b border-[#26131D]"
                                      style={{
                                        backgroundColor: isSentByMe
                                          ? 'rgba(45,212,191,0.06)'
                                          : 'rgba(255,42,95,0.06)',
                                      }}
                                    >
                                      <View className="flex-row items-center gap-1.5">
                                        <Ionicons
                                          name={isSentByMe ? 'paper-plane' : 'mail-unread'}
                                          size={12}
                                          color={isSentByMe ? '#2dd4bf' : '#FF4B72'}
                                        />
                                        <Text
                                          className="text-[10px] font-bold"
                                          style={{ color: isSentByMe ? '#2dd4bf' : '#FF4B72' }}
                                        >
                                          {isSentByMe
                                            ? `Sent by You ➔ ${roomGroup.partnerName}`
                                            : `Received from ${roomGroup.partnerName}`}
                                        </Text>
                                      </View>

                                      <View className="flex-row items-center gap-2">
                                        {statusDetail.actionLabel ? (
                                          <View className="px-1.5 py-0.5 rounded bg-white/5">
                                            <Text className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-wider">
                                              {statusDetail.actionLabel}
                                            </Text>
                                          </View>
                                        ) : null}

                                        {/* Bookmark Save/Unsave Button */}
                                        <TouchableOpacity
                                          onPress={() => toggleSaveDare(String(challenge.id))}
                                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                          className="p-0.5"
                                        >
                                          <Ionicons
                                            name={isSaved ? 'bookmark' : 'bookmark-outline'}
                                            size={15}
                                            color={isSaved ? '#FB923C' : '#9CA3AF'}
                                          />
                                        </TouchableOpacity>
                                      </View>
                                    </View>

                                    {/* Card Image if available */}
                                    {challenge.image && !isExpired && (
                                      <Image
                                        source={
                                          typeof challenge.image === 'string'
                                            ? { uri: challenge.image }
                                            : challenge.image
                                        }
                                        className="w-full h-36"
                                        resizeMode="cover"
                                      />
                                    )}

                                    {/* Card Content Details */}
                                    <View className="p-4">
                                      <View className="flex-row items-center justify-between mb-2">
                                        <View className="px-2.5 py-0.5 rounded-full bg-[#2E1220] border border-[#44182E]">
                                          <Text className="text-[10px] font-bold uppercase tracking-wider text-[#FF3366]">
                                            {challenge.category || 'Dare'}
                                          </Text>
                                        </View>
                                        <View className="flex-row items-center gap-1">
                                          <Ionicons name="time-outline" size={12} color="#9CA3AF" />
                                          <Text className="text-[10px] font-medium text-[#9CA3AF]">
                                            {formatCardTime(challenge)}
                                          </Text>
                                        </View>
                                      </View>

                                      <Text className="text-[17px] font-black tracking-tight text-white mb-1.5">
                                        {challenge.title}
                                      </Text>

                                      {challenge.description ? (
                                        <Text className="text-xs leading-5 text-[#CBD5E1] font-medium mb-2.5">
                                          {challenge.description}
                                        </Text>
                                      ) : null}

                                      {/* Personal Message Note */}
                                      {challenge.message ? (
                                        <View className="p-3 rounded-xl flex-row items-start gap-2 mt-1 border border-[#3E182A] bg-[#220E18]">
                                          <Ionicons
                                            name="heart"
                                            size={14}
                                            color="#FF3366"
                                            style={{ marginTop: 2 }}
                                          />
                                          <View className="flex-1">
                                            <Text className="text-[9px] font-bold uppercase tracking-wider text-[#FF4B72] mb-0.5">
                                              Note from {isSentByMe ? 'You' : roomGroup.partnerName}:
                                            </Text>
                                            <Text className="text-xs italic text-[#FCE7F3]">
                                              &ldquo;{challenge.message}&rdquo;
                                            </Text>
                                          </View>
                                        </View>
                                      ) : null}
                                    </View>
                                  </View>
                                );
                              })}
                            </View>
                          ))}
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* ── EMPTY STATE WHEN CATEGORY HAS 0 ITEMS AND IS TAPPED ── */}
        {expandedCategory && filteredHistory.length === 0 && challengeHistory.length > 0 && (
          <View className="rounded-[22px] p-6 items-center bg-[#160B10] border border-[#26131D] mb-4">
            <Ionicons name="sparkles-outline" size={28} color="#FF3366" />
            <Text className="text-white font-bold text-sm mt-2.5">
              {activeFilter === 'SAVED'
                ? 'No Saved Dares Yet'
                : activeFilter === 'SENT_BY_ME'
                ? 'No Dares Sent by You Yet'
                : activeFilter === 'RECEIVED'
                ? 'No Received Dares Yet'
                : 'No Dares in this section'}
            </Text>
            <Text className="text-[#9CA3AF] text-xs text-center mt-1 max-w-[240px]">
              {activeFilter === 'SAVED'
                ? 'Tap the bookmark icon on any dare card to save it here for easy access!'
                : 'Challenges for this category will appear here dynamically as you play.'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
