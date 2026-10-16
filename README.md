# Graba's Room, 3 AM

Lični portfolio Ahmeda Grabusa (Graba), softverskog inženjera iz Bosne i Hercegovine.

Uživo: https://graba-portofolio.grabafaceit.workers.dev

Portfolio je jedna tamna 3D soba u tri ujutro: rebrasti zidovi, krovni prozor kroz koji pada hladna mjesečina, tamnocrveni tepih, bijeli sto i akvarijum koji svijetli tirkizno. Svaki predmet na stolu nešto otvara:

| Predmet | Šta otvara |
| --- | --- |
| Stari računar (CRT) | Projekti kao programi (`MYSHISHA.EXE`, `GLAZE.EXE`...), terminal sa komandama |
| Crveni telefon | Kontakt: poziv, Viber, WhatsApp, email, GitHub. Povremeno zazvoni |
| Telefonska sekretarica | O meni, kao preslušana poruka sa titlovima |
| Džezva i fildžan | "Idemo na kafu" |
| Ceduljice na monitoru | Usluge i način rada |
| Diskete i disk-drajv | Vremenska linija po godinama |
| Plakat "SKOČI." | O meni |
| Akvarijum | Ribice prate miš ili prst, dodir ih rasprši |
| Stona lampa | Pali i gasi svjetlo u sobi (pamti se) |
| Kasetofon | Zvuk sobe (pamti se, ugašen po defaultu) |
| Tastatura | Alati i tehnologije |

Svjetlo kroz krovni prozor prati pravo doba dana u Mostaru (Europe/Sarajevo), a kad u Mostaru pada kiša (Open-Meteo), kapi klize niz staklo. Zidni sat pokazuje mostarsko vrijeme.

Postoji i **klasična verzija**: obična stranica sa svim sadržajem. Otvara se dugmetom "Klasična verzija", a sama se prikaže ako uređaj nema WebGL ili ako je uključeno smanjeno kretanje (reduced motion). Sav sadržaj klasične verzije je i u `index.html` kao pravi HTML, zbog Googlea.

Soba je inspirisana radom [Andrea Jorgensen · hideou.se](https://hideou.se). Sve u sobi je napravljeno u kodu, bez njenih rendera i bez preuzetih modela.

## Kako je napravljeno

Bez frameworka i bez build koraka: HTML, CSS i JavaScript moduli.

- `js/i18n.js` je jedini izvor sadržaja (projekti, usluge, kontakt), na engleskom i bosanskom.
- `js/main.js` jezik, gornja traka, boot ekran "GRABA OS" i klasična verzija. 3D dio se učitava tek kad zatreba.
- `js/room.js` kamera, oznake predmeta, paneli, terminal, zvono telefona, prilagođavanje kvaliteta.
- `js/scene.js` soba i svi predmeti (three.js geometrija i materijali), raspored za širok ekran i za uspravan mobitel.
- `js/post.js` bloom, filmsko zrno, vinjeta i blaga hromatska aberacija.
- `js/crt.js` ekran računara (canvas tekstura), `js/textures.js` plakat, sat, ceduljice.
- `js/mostar.js` vrijeme i kiša u Mostaru, `js/sound.js` zvuk napravljen u WebAudio, bez audio fajlova.
- `js/classic.js` klasična verzija; isti kod pravi i statični HTML (`tools/staticno.mjs`).
- three.js (r169) je lokalno u `assets/vendor/`, fontovi (VT323, Inter Tight, SIL OFL) u `assets/fonts/`.

Kvalitet se sam prilagođava: ako je kadar sporiji od 25 ms, prvo se smanji rezolucija, pa se ugasi bloom, pa sjene. Kad tab nije vidljiv ili je otvorena klasična verzija, soba se ne crta.

## Pokretanje

```
node serve.mjs
```

Zatim otvori http://localhost:8080. Lokalni server šalje i zaglavlja iz `_headers` (CSP), kao Cloudflare.

Za probu: `?hour=7.5` postavlja sat u Mostaru, `?rain=1` uključuje kišu, `?view=classic` otvara klasičnu verziju.

Poslije izmjene sadržaja u `js/i18n.js` ili `js/classic.js`, ili inline skripti u `index.html`:

```
node tools/staticno.mjs
```

To upiše klasičnu verziju u `index.html` i osvježi CSP hasheve u `_headers`.

Prethodna verzija portfolija je na grani `stara-verzija`.

## Kontakt

- Email: grabafaceit@gmail.com
- Telefon: +387 60 349 4625
- GitHub: [grabator](https://github.com/grabator)
