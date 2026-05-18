import type { Event } from "@/lib/types";

const NOW_ISO = new Date().toISOString();

/**
 * Static FALLBACK events — shown on /events when DB is empty.
 * Also used by /events/[id] and /events/[id]/register so deep-links
 * to f1..f4 don't 404 when DB has no rows yet.
 *
 * All fallback events:
 * - status: approved (visible on public /events query)
 * - registration_enabled: false (no internal form for fakes)
 * - link: null (no external CTA either — disabled "details soon")
 */
export const FALLBACK_EVENTS: Event[] = [
  {
    id: "f1",
    title: "Chișinău 10K",
    description: "the main spring road race.",
    cover_url: "/brand/imagery/runner-asphalt-line.jpg",
    kind: "race",
    starts_at: "2026-05-25T08:00:00Z",
    ends_at: null,
    location: "Valea Morilor park",
    link: null,
    active: true,
    sort_order: 0,
    status: "approved",
    created_by: null,
    moderator_note: null,
    moderated_by: null,
    moderated_at: null,
    host_trainer_id: null,
    host_club_id: null,
    registration_enabled: false,
    max_participants: null,
    created_at: NOW_ISO,
  },
  {
    id: "f2",
    title: "OM Live with ambassadors",
    description: "live stream with the network coaches.",
    cover_url: "/brand/imagery/yoga-rooftop.jpg",
    kind: "live",
    starts_at: "2026-05-12T19:00:00Z",
    ends_at: null,
    location: "Instagram @om",
    link: null,
    active: true,
    sort_order: 0,
    status: "approved",
    created_by: null,
    moderator_note: null,
    moderated_by: null,
    moderated_at: null,
    host_trainer_id: null,
    host_club_id: null,
    registration_enabled: false,
    max_participants: null,
    created_at: NOW_ISO,
  },
  {
    id: "f3",
    title: "rooftop yoga · sunrise",
    description: "at sunrise in the city center.",
    cover_url: "/brand/imagery/yoga-rooftop.jpg",
    kind: "community",
    starts_at: "2026-06-02T06:30:00Z",
    ends_at: null,
    location: "Press House",
    link: null,
    active: true,
    sort_order: 0,
    status: "approved",
    created_by: null,
    moderator_note: null,
    moderated_by: null,
    moderated_at: null,
    host_trainer_id: null,
    host_club_id: null,
    registration_enabled: false,
    max_participants: null,
    created_at: NOW_ISO,
  },
  {
    id: "f4",
    title: "trail half marathon",
    description: "through the Codrii forest paths.",
    cover_url: "/brand/imagery/runner-forest.jpg",
    kind: "race",
    starts_at: "2026-06-14T07:00:00Z",
    ends_at: null,
    location: "Codrii forest",
    link: null,
    active: true,
    sort_order: 0,
    status: "approved",
    created_by: null,
    moderator_note: null,
    moderated_by: null,
    moderated_at: null,
    host_trainer_id: null,
    host_club_id: null,
    registration_enabled: false,
    max_participants: null,
    created_at: NOW_ISO,
  },
];

export function findFallbackEvent(id: string): Event | null {
  return FALLBACK_EVENTS.find((e) => e.id === id) ?? null;
}
