import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "./actions";
import { PhotoUpload } from "./PhotoUpload";
import { GalleryUpload } from "./GalleryUpload";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) return <p className="text-om-muted">Профиль не найден.</p>;

  const socials = (profile.socials ?? {}) as Record<string, string>;
  const achievements = (profile.achievements ?? []) as string[];
  const gallery = (profile.gallery ?? []) as string[];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold">Профиль</h1>
        <p className="text-om-muted mt-2">Эти данные показываются в публичной карточке тренера на сайте.</p>
      </div>

      <div className="rounded-3xl bg-white p-8 space-y-4">
        <PhotoUpload
          userId={user.id}
          currentUrl={profile.photo_url}
          field="photo_url"
          label="Фото профиля"
          accept="image/*"
          maxBytes={2 * 1024 * 1024}
        />
        <GalleryUpload userId={user.id} current={gallery} />
      </div>

      <form action={updateProfile} className="rounded-3xl bg-white p-8 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Имя и фамилия</label>
          <input
            name="full_name"
            defaultValue={profile.full_name}
            required
            className="w-full rounded-xl border border-black/10 px-4 py-3"
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Клуб</label>
            <input
              name="club"
              defaultValue={profile.club ?? ""}
              className="w-full rounded-xl border border-black/10 px-4 py-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Вид спорта</label>
            <input
              name="sport"
              defaultValue={profile.sport ?? ""}
              className="w-full rounded-xl border border-black/10 px-4 py-3"
            />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Дата рождения</label>
            <input
              type="date"
              name="birthdate"
              defaultValue={profile.birthdate ?? ""}
              className="w-full rounded-xl border border-black/10 px-4 py-3"
            />
            <p className="text-xs text-om-muted mt-1">Возраст рассчитывается автоматически.</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Промокод</label>
            <input
              defaultValue={profile.promo_code ?? ""}
              disabled
              className="w-full rounded-xl border border-black/10 px-4 py-3 bg-om-cream text-om-muted"
            />
            <p className="text-xs text-om-muted mt-1">Меняет только админ.</p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">О себе</label>
          <textarea
            name="bio"
            rows={4}
            defaultValue={profile.bio ?? ""}
            placeholder="Коротко о подходе, опыте и том, что важно для подопечных."
            className="w-full rounded-xl border border-black/10 px-4 py-3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Цитата</label>
          <input
            name="quote"
            defaultValue={profile.quote ?? ""}
            placeholder="Одна сильная фраза о тренировках или о жизни."
            className="w-full rounded-xl border border-black/10 px-4 py-3"
          />
          <p className="text-xs text-om-muted mt-1">Большой шрифт в попапе — то, что зацепит первым.</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">История</label>
          <textarea
            name="story"
            rows={6}
            defaultValue={profile.story ?? ""}
            placeholder="Длинная история — путь к спорту, ключевые моменты, философия. Поддерживается **Markdown**."
            className="w-full rounded-xl border border-black/10 px-4 py-3"
          />
          <p className="text-xs text-om-muted mt-1">Можно с **жирным**, абзацами и списками.</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Интро-видео (URL)</label>
          <input
            name="intro_video_url"
            defaultValue={profile.intro_video_url ?? ""}
            placeholder="https://youtu.be/... или https://..."
            className="w-full rounded-xl border border-black/10 px-4 py-3"
          />
          <p className="text-xs text-om-muted mt-1">YouTube/Vimeo или прямой mp4.</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Регалии и достижения</label>
          <textarea
            name="achievements"
            rows={4}
            defaultValue={achievements.join("\n")}
            placeholder="По одной строке&#10;Чемпион Молдовы 2023&#10;Тренер года в Bigsport"
            className="w-full rounded-xl border border-black/10 px-4 py-3 font-mono text-sm"
          />
          <p className="text-xs text-om-muted mt-1">По одной строке. Пустые строки игнорируются.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Instagram</label>
            <input
              name="instagram"
              defaultValue={socials.instagram ?? ""}
              placeholder="@nickname"
              className="w-full rounded-xl border border-black/10 px-4 py-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">TikTok</label>
            <input
              name="tiktok"
              defaultValue={socials.tiktok ?? ""}
              placeholder="@nickname"
              className="w-full rounded-xl border border-black/10 px-4 py-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Telegram</label>
            <input
              name="telegram"
              defaultValue={socials.telegram ?? ""}
              placeholder="@nickname"
              className="w-full rounded-xl border border-black/10 px-4 py-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">YouTube</label>
            <input
              name="youtube"
              defaultValue={socials.youtube ?? ""}
              placeholder="@channel"
              className="w-full rounded-xl border border-black/10 px-4 py-3"
            />
          </div>
        </div>
        <button
          type="submit"
          className="rounded-full bg-om-ink text-om-cream px-6 py-3 font-medium hover:bg-om-blue-dark transition"
        >
          Сохранить
        </button>
      </form>
    </div>
  );
}
