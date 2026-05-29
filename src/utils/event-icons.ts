import type {LucideIcon} from 'lucide-react-native';
import {
  Baby,
  ChefHat,
  Drama,
  Film,
  Flag,
  GraduationCap,
  Heart,
  MessageCircle,
  Mic,
  Music2,
  Palette,
  ScrollText,
  Sparkles,
  Users,
} from 'lucide-react-native';

const EVENT_ICONS: Record<string, LucideIcon> = {
  event_001: Flag,
  event_002: MessageCircle,
  event_003: Mic,
  event_004: Music2,
  event_005: Film,
  event_006: Drama,
  event_007: ScrollText,
  event_008: Baby,
  event_009: ScrollText,
  event_010: ChefHat,
  event_011: Users,
  event_012: Sparkles,
  event_013: Heart,
  event_014: Palette,
  event_015: GraduationCap,
};

export function getEventIcon(eventId: string): LucideIcon {
  return EVENT_ICONS[eventId] ?? Sparkles;
}

/** Normalize API event name for lookup (lowercase, single spaces). */
export function normalizeEventNameKey(name: string): string {
  return name.toLowerCase().replace(/\s+/g, ' ').trim();
}

/** Map backend event names to dashboard icon ids (event_001 … event_015). */
const EVENT_NAME_TO_ICON_ID: Record<string, string> = {
  'national anthem': 'event_001',
  'tongue twister': 'event_002',
  singing: 'event_003',
  dancing: 'event_004',
  'movie dialogues': 'event_005',
  'comedy act / skit': 'event_006',
  shayari: 'event_007',
  rhymes: 'event_008',
  poetry: 'event_009',
  cooking: 'event_010',
  'twins act': 'event_011',
  'special talent': 'event_012',
  'mom and kids act': 'event_013',
  'craft making': 'event_014',
  'kids teachers group act': 'event_015',
};

export function resolveDashboardEventId(event: {
  id: string | number;
  title?: string;
  name?: string;
}): string {
  const key = normalizeEventNameKey(event.title ?? event.name ?? '');
  return EVENT_NAME_TO_ICON_ID[key] ?? String(event.id);
}

export function formatEventTitle(name: string): string {
  return name
    .trim()
    .split(/\s*\/\s*/)
    .map((segment) =>
      segment
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' '),
    )
    .join(' / ');
}
