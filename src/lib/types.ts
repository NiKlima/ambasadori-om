export type UserRole = "trainer" | "admin";
export type SubmissionStatus = "pending" | "approved" | "rejected";
export type ChallengeKind = "photo_ai" | "video_ai" | "survey_trainee" | "manual";
export type ProductKind = "merch" | "gear" | "service" | "digital" | "perk";
export type OrderStatus = "pending" | "approved" | "fulfilled" | "cancelled";
export type EventKind = "race" | "live" | "workshop" | "community";
export type EventStatus = "draft" | "pending" | "approved" | "rejected";

export type Profile = {
  id: string;
  role: UserRole;
  full_name: string;
  club: string | null;
  club_id: string | null;
  sport: string | null;
  promo_code: string | null;
  photo_url: string | null;
  bio: string | null;
  socials: Record<string, string>;
  achievements: string[];
  birthdate: string | null;
  quote: string | null;
  story: string | null;
  intro_video_url: string | null;
  gallery: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type Club = {
  id: string;
  name: string;
  slug: string | null;
  logo_url: string | null;
  description: string | null;
  sport_focus: string | null;
  city: string | null;
  website: string | null;
  sort_order: number;
  active: boolean;
  created_at: string;
};

export type Challenge = {
  id: string;
  title: string;
  description: string | null;
  points: number;
  requires_moderation: boolean;
  active: boolean;
  created_at: string;
  kind: ChallengeKind;
  cover_url: string | null;
  ai_prompt: string | null;
  ai_check: boolean;
  intro_video_url: string | null;
  sort_order: number;
};

export type Event = {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  kind: EventKind;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  link: string | null;
  active: boolean;
  sort_order: number;
  status: EventStatus;
  created_by: string | null;
  moderator_note: string | null;
  moderated_by: string | null;
  moderated_at: string | null;
  host_trainer_id: string | null;
  host_club_id: string | null;
  registration_enabled: boolean;
  max_participants: number | null;
  created_at: string;
};

export type EventRegistration = {
  id: string;
  event_id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  note: string | null;
  consent: boolean;
  created_at: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export type AiVerdict = {
  verdict: "approved" | "rejected";
  confidence: number;
  reasoning: string;
  model?: string;
  ms?: number;
};

export type Submission = {
  id: string;
  trainer_id: string;
  challenge_id: string;
  photo_url: string | null;
  video_url: string | null;
  link: string | null;
  note: string | null;
  status: SubmissionStatus;
  moderator_comment: string | null;
  moderated_by: string | null;
  moderated_at: string | null;
  created_at: string;
  ai_verdict: AiVerdict | null;
};

export type Product = {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  kind: ProductKind;
  price_points: number;
  stock: number | null;
  active: boolean;
  featured: boolean;
  sort_order: number;
  created_at: string;
};

export type Order = {
  id: string;
  trainer_id: string;
  product_id: string;
  price_points: number;
  status: OrderStatus;
  trainer_note: string | null;
  admin_note: string | null;
  created_at: string;
  fulfilled_at: string | null;
};

export type SurveyQuestion = {
  id: string;
  challenge_id: string;
  position: number;
  text: string;
  options: { label: string; correct?: boolean }[];
};

export type SurveyResponse = {
  id: string;
  trainer_id: string;
  challenge_id: string;
  trainee_email: string;
  trainee_name: string | null;
  answers: { question_id: string; answer: string }[];
  submitted_at: string;
};

export type PointTransaction = {
  id: string;
  trainer_id: string;
  amount: number;
  reason: string;
  submission_id: string | null;
  created_by: string | null;
  created_at: string;
};

export type LeaderboardRow = {
  id: string;
  full_name: string;
  club: string | null;
  sport: string | null;
  photo_url: string | null;
  bio: string | null;
  socials: Record<string, string>;
  achievements: string[];
  birthdate: string | null;
  quote: string | null;
  story: string | null;
  intro_video_url: string | null;
  gallery: string[];
  total_points: number;
};
