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
| Dresovi na zidovima | Kartica igrača sa karijerom |
| Stolica i nargila | Sjedneš i povučeš |
| Vrata | Nazad na običnu verziju |
| Akvarijum | Ribice prate miš ili prst, dodir ih rasprši |
| Stona lampa | Pali i gasi svjetlo u sobi (pamti se) |
| Kasetofon | Zvuk sobe (pamti se, ugašen po defaultu) |
| Tastatura | Alati i tehnologije |

Po sobi se može malo prošetati: prevlačenjem mišem ili prstom okreće se pogled, a hoda se strelicama ili tipkama WASD (točkić miša ide naprijed i nazad). Na mobitelu je dolje lijevo krug za kretanje kao u FIFI, a dva prsta (štipanje) idu naprijed i nazad. Dugme u donjem desnom uglu vraća početni pogled. Dugme "?" na tren pokaže imena svih predmeta; inače se ime vidi kad je predmet na sredini pogleda ili pod mišem. Kad niko ništa ne dira, monitor sam vrti projekte.

Svjetlo kroz krovni prozor prati pravo doba dana u Mostaru (Europe/Sarajevo), a kad u Mostaru pada kiša (Open-Meteo), kapi klize niz staklo. Zidni sat pokazuje mostarsko vrijeme.

**Glavna stranica je obična verzija** (i na desktopu i na mobitelu): brzi kontakt (Viber, WhatsApp, email), sat i temperatura u Mostaru, i četiri dijela, Radovi, Usluge, O meni i Kontakt, koji staju na jedan ekran, bez dugog listanja. Projekti se gledaju jedan po jedan: velika slika i opis, a mijenjaju se sličicama, strelicama ili tipkama ← →, na mobitelu prevlačenjem. Sav sadržaj je i u `index.html` kao pravi HTML, zbog Googlea.

**3D soba postoji samo na mobitelu i tabletu** (uređaji na dodir). Ulazi se karticom "Uđi u moju sobu". Na desktopu se three.js nikad ne učitava. Na bočnim zidovima sobe su uramljeni dresovi: lijevo ÖZIL 10, EZE 10, RICE 41 i ØDEGAARD 8 (Arsenal), desno DŽEKO 11 (BiH), IBRAHIMOVIĆ 10 (PSG), SCHWEINSTEIGER 31 (Bayern) i FÉLIX 79 (Al-Nassr). Klik na dres otvara karticu igrača: svi klubovi kroz karijeru sa utakmicama i golovima (gdje su poznate i asistencijama), reprezentacija, trofeji i zanimljivost. Uz svaku tabelu piše obuhvat i izvor podataka (`PF.players` u `js/i18n.js`). Pored obje stolice je nargila: klik na stolicu te posjedne, crijevo dođe prema tebi, držiš usnik da povučeš (žar se zažari, voda klokoće), a kad pustiš, dim izađe ispred tebe i raširi se po sobi. Dok sjediš, pogled se može okretati. Iza leđa su vrata, a klik na njih vraća na običnu verziju. Na zadnjem zidu su sat (mostarsko vrijeme i trenutna temperatura u Mostaru) i dvije apstraktne slike. U lijevom uglu je mali gol sa loptom (klik je šut u gol), a u desnom polica sa duhanima za nargilu i svijetlećim natpisom myshishapedia (klik otvara taj projekat na monitoru).

Soba je inspirisana radom [Andrea Jorgensen · hideou.se](https://hideou.se). Sve u sobi je napravljeno u kodu, bez njenih rendera i bez preuzetih modela.

## Kako je napravljeno

Bez frameworka i bez build koraka: HTML, CSS i JavaScript moduli.

- `js/i18n.js` je jedini izvor sadržaja (projekti, usluge, kontakt), na engleskom i bosanskom.
- `js/main.js` jezik, gornja traka, boot ekran "GRABA OS", prelaz između obične verzije i sobe. 3D dio se učitava tek kad zatreba.
- `js/site.js` ponašanje obične verzije: dijelovi kao kartice, projekti jedan po jedan, sat u Mostaru.
- `js/room.js` kamera, oznake predmeta, paneli, terminal, zvono telefona, prilagođavanje kvaliteta.
- `js/scene.js` soba i svi predmeti (three.js geometrija i materijali), raspored za širok ekran i za uspravan mobitel.
- `js/post.js` bloom, filmsko zrno, vinjeta i blaga hromatska aberacija.
- `js/crt.js` ekran računara (canvas tekstura), `js/textures.js` plakat, sat, ceduljice.
- `js/mostar.js` vrijeme i kiša u Mostaru, `js/sound.js` zvuk napravljen u WebAudio, bez audio fajlova.
- `js/classic.js` HTML obične verzije; isti kod pravi i statični HTML (`tools/staticno.mjs`).
- three.js (r169) je lokalno u `assets/vendor/`, fontovi (VT323, Inter Tight, SIL OFL) u `assets/fonts/`.

Kvalitet se sam prilagođava: ako je kadar sporiji od 25 ms, prvo se smanji rezolucija, pa se ugasi bloom, pa sjene. Kad tab nije vidljiv ili je otvorena klasična verzija, soba se ne crta.

## Pokretanje

```
node serve.mjs
```

Zatim otvori http://localhost:8080. Lokalni server šalje i zaglavlja iz `_headers` (CSP), kao Cloudflare.

Za probu (soba, na uređaju na dodir): `?view=room` otvara sobu odmah, `?hour=7.5` postavlja sat u Mostaru, `?rain=1` uključuje kišu.

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
