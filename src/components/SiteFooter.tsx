export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-black/5 bg-om-sand/60">
      <div className="container-xl py-10 grid md:grid-cols-3 gap-8 text-sm text-om-muted">
        <div>
          <div className="flex items-center gap-2 font-semibold text-om-ink mb-3">
            <span className="inline-block w-6 h-6 rounded-full bg-om-blue" />
            OM · Амбассадоры
          </div>
          <p>
            Программа поддержки тренеров от OM. Движение приносит радость, когда ты слышишь своё тело.
          </p>
        </div>
        <div>
          <div className="font-medium text-om-ink mb-3">Программа</div>
          <ul className="space-y-2">
            <li><a href="/#how" className="hover:text-om-ink">Как работает</a></li>
            <li><a href="/#challenges" className="hover:text-om-ink">Челленджи</a></li>
            <li><a href="/leaderboard" className="hover:text-om-ink">Лидерборд</a></li>
            <li><a href="/events" className="hover:text-om-ink">События</a></li>
            <li><a href="/#faq" className="hover:text-om-ink">FAQ</a></li>
          </ul>
        </div>
        <div>
          <div className="font-medium text-om-ink mb-3">Контакты</div>
          <ul className="space-y-2 mb-4">
            <li><a href="/contacts" className="hover:text-om-ink">Написать нам</a></li>
            <li><a href="/privacy" className="hover:text-om-ink">Политика конфиденциальности</a></li>
            <li>
              <a href="mailto:ambasadori@om.md" className="hover:text-om-ink">
                ambasadori@om.md
              </a>
            </li>
          </ul>
          <p className="text-xs">© {new Date().getFullYear()} OM. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
