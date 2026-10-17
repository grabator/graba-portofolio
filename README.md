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

**Na desktopu je "IT žirafa".** Crno-bijela stranica u kojoj je žirafa nacrtana od znakova koda (`{ } [ ] < > / = ; 0 1`), sa mrljama po Voronoi uzorku i nekoliko zelenih riječi (`graba`, `build()`, `ship()`). Žirafa savija vrat i okreće glavu prema mišu, oko prati kursor, povremeno trepne, a znakovi se stalno tiho mijenjaju. Stranica ima sedam dijelova: početak ("Vidim dalje. Pravim bolje."), manifest koji se odmotava u perspektivi, radove poredane uz vrat koji raste nadolje dok se lista, brojke koje se odbroje, usluge i način rada, o meni i kontakt, gdje žirafa izviruje sa strane. Meni se razvlači iz jednog dugmeta, naslovi se "dešifruju" kad se pojave, a gore desno je sat u Mostaru. Uključuje se kad uređaj nije na dodir i ekran je širok bar 900 px; ako nešto ne uspije, ostaje obična verzija. Kad je uključeno "smanji pokrete", sve stoji mirno.

**Na mobitelu i tabletu je obična verzija.** Tu su brzi kontakt (Viber, WhatsApp, email), sat i temperatura u Mostaru, i četiri dijela, Radovi, Usluge, O meni i Kontakt. Projekti se gledaju jedan po jedan, a mijenjaju se sličicama ili prevlačenjem. Sav sadržaj je i u `index.html` kao pravi HTML, zbog Googlea.

**3D soba postoji samo na mobitelu i tabletu** (uređaji na dodir). Ulazi se karticom "Uđi u moju sobu". Na desktopu se three.js nikad ne učitava. Na bočnim zidovima sobe su uramljeni dresovi: lijevo ÖZIL 10, EZE 10, RICE 41 i ØDEGAARD 8 (Arsenal), desno DŽEKO 11 (BiH), IBRAHIMOVIĆ 10 (PSG), SCHWEINSTEIGER 31 (Bayern) i FÉLIX 79 (Al-Nassr). Klik na dres otvara karticu igrača: svi klubovi kroz karijeru sa utakmicama i golovima (gdje su poznate i asistencijama), reprezentacija, trofeji i zanimljivost. Uz svaku tabelu piše obuhvat i izvor podataka (`PF.players` u `js/i18n.js`). Pored obje stolice je nargila: klik na stolicu te posjedne, crijevo dođe prema tebi, držiš usnik da povučeš (žar se zažari, voda klokoće), a kad pustiš, dim izađe ispred tebe i raširi se po sobi. Dok sjediš, pogled se može okretati. Iza leđa su vrata, a klik na njih vraća na običnu verziju. Na zadnjem zidu je u sredini sat (mostarsko vrijeme i trenutna temperatura u Mostaru), a pored njega dva neona: lijevo lopta, desno nargila. Uz akvarijum su dvije LED trake, lijevo hladna, desno topla. Lijevo je taktička tabla kao u svlačionici (teren sa magnetima 4-3-3 i bilješke za SquadJury i FPL, klik otvara SquadJury na monitoru), a ispod nje mali gol sa loptom (klik je šut u gol). Desno je polica MyShishapedia sa pravim logom (`assets/myshishapedia.png`) i 20 okusa iz baze MyShishapedije (klik otvara taj projekat na monitoru). Sve konzerve su jedna geometrija i jedna tekstura, da soba ostane lagana na mobitelu.

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
- `js/z/site.js` desktop stranica sa žirafom (tekstovi, raspored, skrol efekti), `js/z/giraffe.js` žirafa od znakova na canvasu, `js/z/neck.js` vrat kroz dio Radovi.
- `js/classic.js` HTML obične verzije; isti kod pravi i statični HTML (`tools/staticno.mjs`).
- three.js (r169) je lokalno u `assets/vendor/`, fontovi (VT323, Inter Tight, Space Mono, Anton, SIL OFL) u `assets/fonts/`. Mrlje žirafe računa d3-delaunay (ISC), isto lokalno u `assets/vendor/`.

Žirafa se crta samo dok je na ekranu i dok je tab vidljiv; na sporom računaru preskače svaki drugi kadar.

Kvalitet sobe se sam prilagođava: ako je kadar sporiji od 25 ms, prvo se smanji rezolucija, pa se ugasi bloom, pa sjene. Kad tab nije vidljiv ili je otvorena klasična verzija, soba se ne crta.

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
