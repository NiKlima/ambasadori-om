import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "./actions";
import { PhotoUpload } from "./PhotoUpload";
import { GalleryUpload } from "./GalleryUpload";

const FIELD_LABEL_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--om-ink-500)",
  marginBottom: 8,
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return (
      <div className="container-om py-10">
        <div className="bg-white border border-[var(--om-ink-100)] p-8">
          <div className="eyebrow">profile not found</div>
          <p
            className="font-body mt-3"
            style={{ color: "var(--om-ink-500)", fontSize: 14 }}
          >
            contact OM admin at ambasadori@om.md.
          </p>
        </div>
      </div>
    );
  }

  const socials = (profile.socials ?? {}) as Record<string, string>;
  const achievements = (profile.achievements ?? []) as string[];
  const gallery = (profile.gallery ?? []) as string[];

  return (
    <div
      className="container-om grid md:grid-cols-[1.2fr_1fr]"
      style={{ paddingTop: 40, paddingBottom: 96, gap: 28 }}
    >
      {/* LEFT — form */}
      <div>
        <div className="eyebrow">profile editor</div>
        <h1
          className="font-display"
          style={{
            fontWeight: 900,
            fontSize: "clamp(40px, 5vw, 64px)",
            letterSpacing: "-0.04em",
            lineHeight: 0.95,
            margin: "12px 0 28px",
          }}
        >
your card.
          <br />
          your story.
        </h1>

        <form
          action={updateProfile}
          className="bg-white border border-[var(--om-ink-100)] grid"
          style={{ padding: "32px 36px", gap: 20 }}
        >
          <div>
            <div style={FIELD_LABEL_STYLE}>full name</div>
            <input
              className="input"
              name="full_name"
              defaultValue={profile.full_name}
              required
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div style={FIELD_LABEL_STYLE}>club</div>
              <input
                className="input"
                name="club"
                defaultValue={profile.club ?? ""}
              />
            </div>
            <div>
              <div style={FIELD_LABEL_STYLE}>sport</div>
              <input
                className="input"
                name="sport"
                defaultValue={profile.sport ?? ""}
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div style={FIELD_LABEL_STYLE}>birthdate</div>
              <input
                className="input"
                type="date"
                name="birthdate"
                defaultValue={profile.birthdate ?? ""}
              />
              <p
                className="font-mono mt-2"
                style={{
                  fontSize: 11,
                  color: "var(--om-ink-500)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
age is computed automatically
              </p>
            </div>
            <div>
              <div style={FIELD_LABEL_STYLE}>promo code (admin only)</div>
              <input
                className="input"
                defaultValue={profile.promo_code ?? ""}
                disabled
                style={{
                  background: "var(--om-ink-50)",
                  color: "var(--om-ink-500)",
                }}
              />
              <p
                className="font-mono mt-2"
                style={{
                  fontSize: 11,
                  color: "var(--om-ink-500)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
admin can change only
              </p>
            </div>
          </div>
          <div>
            <div style={FIELD_LABEL_STYLE}>about</div>
            <textarea
              className="input"
              name="bio"
              rows={3}
              defaultValue={profile.bio ?? ""}
              placeholder="briefly about your approach, experience and what matters to your clients."
              style={{ resize: "none", fontFamily: "var(--font-body)" }}
            />
          </div>
          <div>
            <div style={FIELD_LABEL_STYLE}>quote</div>
            <input
              className="input"
              name="quote"
              defaultValue={profile.quote ?? ""}
              placeholder="one strong line about training or life."
            />
            <p
              className="font-mono mt-2"
              style={{
                fontSize: 11,
                color: "var(--om-ink-500)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
big type on the card — the thing that hooks first
            </p>
          </div>
          <div>
            <div style={FIELD_LABEL_STYLE}>story · markdown</div>
            <textarea
              className="input"
              name="story"
              rows={6}
              defaultValue={profile.story ?? ""}
              placeholder="the long story — path to sport, key moments, philosophy. **markdown** is supported."
              style={{ resize: "none", fontFamily: "var(--font-body)" }}
            />
            <p
              className="font-mono mt-2"
              style={{
                fontSize: 11,
                color: "var(--om-ink-500)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
bold, paragraphs, lists — markdown
            </p>
          </div>
          <div>
            <div style={FIELD_LABEL_STYLE}>intro video · url</div>
            <input
              className="input"
              name="intro_video_url"
              defaultValue={profile.intro_video_url ?? ""}
              placeholder="https://youtu.be/… or https://…"
            />
            <p
              className="font-mono mt-2"
              style={{
                fontSize: 11,
                color: "var(--om-ink-500)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
youtube · vimeo · direct mp4
            </p>
          </div>
          <div>
            <div style={FIELD_LABEL_STYLE}>credentials · one per line</div>
            <textarea
              className="input"
              name="achievements"
              rows={4}
              defaultValue={achievements.join("\n")}
              placeholder={"Berlin Marathon 2024 — finisher\nCoach of the Year — Bigsport 2023"}
              style={{ resize: "none", fontFamily: "var(--font-mono)", fontSize: 13 }}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <div style={FIELD_LABEL_STYLE}>instagram</div>
              <input
                className="input"
                name="instagram"
                defaultValue={socials.instagram ?? ""}
                placeholder="@nickname"
              />
            </div>
            <div>
              <div style={FIELD_LABEL_STYLE}>tiktok</div>
              <input
                className="input"
                name="tiktok"
                defaultValue={socials.tiktok ?? ""}
                placeholder="@nickname"
              />
            </div>
            <div>
              <div style={FIELD_LABEL_STYLE}>telegram</div>
              <input
                className="input"
                name="telegram"
                defaultValue={socials.telegram ?? ""}
                placeholder="@nickname"
              />
            </div>
            <div>
              <div style={FIELD_LABEL_STYLE}>youtube</div>
              <input
                className="input"
                name="youtube"
                defaultValue={socials.youtube ?? ""}
                placeholder="@channel"
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-blue"
            style={{ alignSelf: "flex-start", marginTop: 8 }}
          >
save profile
          </button>
        </form>
      </div>

      {/* RIGHT — photo + gallery */}
      <div className="flex flex-col" style={{ gap: 20 }}>
        <div>
          <div className="eyebrow">main photo</div>
          <div
            className="bg-white border border-[var(--om-ink-100)] mt-3"
            style={{ padding: "28px" }}
          >
            <PhotoUpload
              userId={user.id}
              currentUrl={profile.photo_url}
              field="photo_url"
              label="profile photo"
              accept="image/*"
              maxBytes={2 * 1024 * 1024}
            />
          </div>
        </div>
        <div>
          <div className="eyebrow">gallery</div>
          <div
            className="bg-white border border-[var(--om-ink-100)] mt-3"
            style={{ padding: "24px" }}
          >
            <GalleryUpload userId={user.id} current={gallery} />
          </div>
        </div>
      </div>
    </div>
  );
}
