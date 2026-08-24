# UPLIFY Preview Hub

Клієнтські концепти публікуються за адресою `https://preview.uplify.agency/<slug>/`.

## Правила

- один клієнт — одна папка `docs/<slug>/`;
- корінь домену не містить переліку клієнтів;
- кожне превʼю має `noindex,nofollow,noarchive`, власні title, description, canonical, Open Graph і Twitter Card;
- `canonical`, `og:url` та `og:image` завжди використовують `https://preview.uplify.agency/<slug>/`;
- Open Graph — локальний PNG 1200×630;
- у публічну папку не потрапляють брифи, аудити, внутрішні нотатки, скриншоти ревʼю, маніфести з приватними даними або службові файли Codex;
- публікація йде через окрему гілку та pull request; GitHub Actions не потрібні — Pages читає `main/docs`.

Детальна автоматизована процедура є у скиллі `commerce-presales-concept`.
