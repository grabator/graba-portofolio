/* Sadržaj portfolija na engleskom i bosanskom. Projekti, usluge i kontakt su ovdje. */
window.PF = {
  contact: {
    email: 'grabafaceit@gmail.com',
    phone: '+387 60 349 4625',
    tel: '+387603494625',
    viber: 'viber://chat?number=%2B387603494625',
    whatsapp: 'https://wa.me/387603494625',
    github: 'https://github.com/grabator'
  },
  credit: { name: 'Andrea Jorgensen', site: 'hideou.se', url: 'https://hideou.se' },
  exe: { myshishapedia: 'MYSHISHA.EXE', squadjury: 'SQUADJURY.EXE', salon: 'GLAZE.EXE', lounge: 'LOUNGE.EXE', svecana: 'SVECANA.EXE', planinka: 'PLANINKA.EXE', mostar: 'MOSTAR.EXE', grabpoints: 'GRABPTS.EXE', apoteke: 'APOTEKE.EXE' },
  work: [
    { id: 'myshishapedia', year: '2025', img: 'assets/work/myshishapedia.jpg', live: 'https://myshishapedia.com', src: 'https://github.com/grabator/myshishapedia', tags: ['JavaScript', 'Node.js', 'SVG', 'Cloudflare Pages'] },
    { id: 'squadjury', year: '2026', img: 'assets/work/squadjury.jpg', live: 'https://squadjury.com', src: 'https://github.com/grabator/squadjury', tags: ['JavaScript', 'Cloudflare Workers', 'D1', 'OCR'] },
    { id: 'salon', year: '2026', img: 'assets/work/beauty-salon.jpg', live: 'https://beauty-salon.grabafaceit.workers.dev/', src: 'https://github.com/grabator/beauty-salon', tags: ['JavaScript', 'SVG', 'PWA', 'Cloudflare Workers'] },
    { id: 'lounge', year: '2026', img: 'assets/work/exclusive-lounge.jpg', live: 'https://rezervacije-production-6f84.up.railway.app/r/exclusive/rezervacije', src: 'https://github.com/grabator/exclusive-lounge-caffe-rezervacije', tags: ['Angular 19', '.NET 10', 'SQLite', 'Railway'] },
    { id: 'svecana', year: '2026', img: 'assets/work/svecana-sala.jpg', live: 'https://svecana-sala.grabafaceit.workers.dev/', src: 'https://github.com/grabator/svecana-sala', tags: ['JavaScript', 'Cloudflare Workers', 'Google Calendar', 'i18n'] },
    { id: 'planinka', year: '2026', img: 'assets/work/planinka.jpg', live: 'https://planinka.grabafaceit.workers.dev/', src: 'https://github.com/grabator/planinka', tags: ['JavaScript', 'SVG', 'Cloudflare'] },
    { id: 'mostar', year: '2026', img: 'assets/work/old-bridge-mostar.jpg', src: 'https://github.com/grabator/old-bridge-mostar', tags: ['JavaScript', 'SVG', 'Scroll animation'] },
    { id: 'grabpoints', year: '2025', art: 'pitch', src: 'https://github.com/grabator/IB210176-seminarski-rs2', tags: ['.NET 10', 'RabbitMQ', 'ONNX', 'Flutter', 'Docker'] },
    { id: 'apoteke', year: '2025', art: 'map', src: 'https://github.com/grabator/dezurne-apoteke', tags: ['Next.js 16', 'React 19', 'PWA'] }
  ],
  stack: ['.NET', 'C#', 'Angular', 'TypeScript', 'React', 'Next.js', 'JavaScript', 'Flutter', 'Dart', 'Java', 'Spring Boot', 'SQL Server', 'RabbitMQ', 'Docker', 'Cloudflare', 'Node.js', 'SVG', 'Git'],

  en: {
    title: 'Ahmed Grabus · Software Engineer',
    desc: 'Ahmed Grabus (Graba), software engineer from Bosnia and Herzegovina. Fast, beautiful websites and full-stack products.',
    nav: { work: 'Work', services: 'Services', process: 'Process', about: 'About' },
    copy: 'Copy email', copied: 'Email copied',
    workK: 'Selected work', workH: 'Things I designed, built and *shipped.*',
    view: 'View', live: 'Live site', code: 'Source', liveTag: 'Live',
    items: {
      myshishapedia: ['MyShishapedia', 'Web app · Encyclopedia', 'A bilingual hookah flavor encyclopedia: ingredient breakdowns, flavor profiles, comparisons, a mixer and a quiz. A custom static site generator prerenders 190+ pages, with fuzzy search and shareable story cards.'],
      squadjury: ['SquadJury', 'Web app · Fantasy football', 'Fantasy Premier League managers post their squad with one screenshot and the community rates it from 1 to 10 before the deadline. The squad is read in the browser (OCR), with head to head duels, private leagues, real points after each gameweek and badges. Full stack on Cloudflare Workers, D1 and R2.'],
      salon: ['Glaze Nail Studio', 'Website · Nail salon', 'A website for a nail salon: try a polish colour, shape and style on a realistic hand drawn in SVG, browse designs by style and season, get shades that match an outfit photo and send a booking inquiry to Viber or WhatsApp in three steps. Three languages, installable as an app.'],
      svecana: ['Svečana sala', 'Website · Wedding venue', 'A demo site for wedding venues: an availability calendar synced from Google Calendar through a Cloudflare Worker, an instant price estimate, inquiries straight to Viber, viewing booking and a guest page with a QR code.'],
      mostar: ['Old Bridge Mostar', 'Website · Scroll story', 'A cinematic scroll story about Mostar. Layered SVG scenes of the Old Bridge and the Neretva, a diver leaping from the arch, and an endless places slider, all drawn in code.'],
      planinka: ['Planinka', 'Website · Mountain cabin', 'A website for a mountain cabin on Vlašić: seasonal prices with a stay calculator, live weather, a gallery and booking inquiries to Viber or WhatsApp. Bosnian, English and German.'],
      grabpoints: ['GrabPoints', 'Product · Fantasy football', 'A Fantasy Premier League companion with ML-driven predictions for points, captain picks and transfers. A .NET 10 API and worker over RabbitMQ, a Flutter mobile app and a desktop admin.'],
      lounge: ['Exclusive Lounge', 'Live app · Reservations', 'A live table booking app for Exclusive Caffe Lounge: guests pick an event and their exact table on an interactive floor plan. Admin panel, guest list export to PDF, and a Telegram alert to the owner for every booking.'],
      apoteke: ['Dežurne apoteke BiH', 'Web app · PWA', 'Shows which pharmacies are on duty right now in Bosnia and Herzegovina, with distance, one-tap calling and directions.']
    },
    servK: 'Services', servH: 'What I can do for *you.*',
    services: [
      ['Websites for businesses', 'Cabins, wedding venues, beauty salons, restaurants and shops. Fast, mobile-first sites where customers can check availability and contact you in seconds.'],
      ['Full-stack products', 'Web applications from database to interface: .NET and Java backends, Angular, React and Next.js frontends, clean architecture.'],
      ['Mobile apps', 'Cross-platform apps in Flutter, connected to your own API, with the same attention to detail as the web.'],
      ['Speed, SEO and care', 'Pages that load fast, rank on Google and keep working. I can also look after updates once the site is live.']
    ],
    procK: 'Process', procH: 'Simple, direct, *no surprises.*',
    process: [
      ['Quick call', 'We talk about what you need, who your customers are and what the site has to do.'],
      ['First version', 'You see a working version of your site within days, not weeks.'],
      ['Polish together', 'We adjust texts, photos and details until it feels exactly right.'],
      ['Launch and care', 'The site goes live on your domain. Updates are a message away.']
    ],
    aboutK: 'About', aboutH: 'A software engineer who sweats the *details.*',
    aboutP: ['I build products end to end, from the database to the last animation. I work on full-stack software and make websites that help local businesses get found and booked.', 'I care about clean architecture, real performance and interfaces that feel good to use.'],
    facts: [['Open for', 'New projects'], ['Based in', 'Bosnia and Herzegovina'], ['Focus', 'Web, full-stack, mobile'], ['Languages', 'Bosnian, English']],
    stackK: 'Tools I use',
    contactK: 'Contact', contactH: 'Let\'s build something *good.*',
    contactP: 'Tell me about your idea, your business or a project you need help with. I usually reply the same day.',
    email: 'Email', phone: 'Phone', viber: 'Viber', whatsapp: 'WhatsApp', github: 'GitHub',
    foot: 'Designed and built by Ahmed Grabus.',
    credit: 'Room inspired by',
    role: 'Software engineer',
    hero: 'I build fast, beautiful websites and full-stack products, from the database to the last animation.',
    site: {
      skip: 'Skip to content',
      tabs: { work: 'Work', services: 'Services', about: 'About', contact: 'Contact' },
      avail: 'Available for new projects', place: 'Bosnia and Herzegovina', navLabel: 'Sections',
      roomT: 'Step into my room', roomP: '3 AM, aquarium, old computer', prev: 'Previous project', next: 'Next project'
    },
    room: {
      loading: 'Loading projects...', press: 'PRESS ANY KEY TO START', tap: 'TAP TO START', nogl: 'This room needs WebGL. Opening the classic view.',
      hintD: 'Click anything · drag to look · WASD to walk', hintM: 'Tap anything · drag to look · stick to walk',
      reset: 'Back to the start view', showNames: 'Show all names',
      back: 'Back', classic: 'Classic view', room: 'Enter the room', soundOn: 'Sound on', soundOff: 'Sound off', lang: 'Language',
      names: { monitor: 'Projects', phone: 'Contact', answering: 'About me', coffee: 'Grab a coffee', notes: 'Services', floppies: 'Timeline', poster: 'Skoči.', aquarium: 'Aquarium', lamp: 'Desk lamp', cassette: 'Sound', keyboard: 'Tech stack' },
      objs: { monitor: 'Old computer', phone: 'Red phone', answering: 'Answering machine', coffee: 'Džezva and fildžan', notes: 'Sticky notes', floppies: 'Floppy disks', poster: 'Poster', aquarium: 'Aquarium', lamp: 'Desk lamp', cassette: 'Cassette player', keyboard: 'Keyboard' },
      lampOn: 'Lights on', lampOff: 'Lights off', fish: 'The fish scattered. They will be back.',
      programs: 'Programs', run: 'Run live', source: 'Source', all: 'All programs', loadingExe: 'LOADING', noLive: 'Source only',
      termHint: 'Type help and press Enter', termLabel: 'Terminal command',
      ring: 'Ring ring', dial: 'Dialing', callH: 'Pick up the phone', call: 'Call', copyEmail: 'Copy email',
      amNew: '1 NEW MESSAGE', amPlay: 'Play the message again', amFrom: 'From: Graba',
      coffeeH: 'Let\'s grab a coffee', coffeeP: 'Pull up a chair. Tell me about your idea, your business or a project you need help with, over a Bosnian coffee or online. I usually reply the same day.', coffeeCta: 'Send a message',
      timelineH: 'Timeline', timelineP: 'Pick a floppy to load a year.', disk: 'Disk',
      stackP: 'The keys I press most.',
      servP: 'Notes stuck to the monitor so I never forget.',
      posterP: 'The divers of the Old Bridge in Mostar jump. So can you: start the project you keep postponing.'
    },
    term: {
      boot: ['GRABA OS v1.0', 'Type help and press Enter.'],
      help: ['help            this list', 'projects        all programs', 'open <name>     run a program (open glaze)', 'whoami          who lives here', 'contact         how to reach me', 'services        what I can do for you', 'stack           tools I use', 'coffee          take a break', 'skoci           jump', 'lang en|bs      change language', 'history         last commands', 'clear           clean the screen', 'exit            leave the computer'],
      unknown: 'Bad command or file name: ', notFound: 'No such program: ', opening: 'Running ', coffee: ['  ( (', '   ) )', ' ........', ' |      |]', ' \\      /', '  `----\'', 'Coffee is ready. Write to me and we will talk.'],
      skoci: ['3...', '2...', '1...', 'SKOČI!', '  \\o/', '   |', '  / \\', '~~~~~~ splash ~~~~~~'], empty: 'No commands yet.', bye: 'Bye.'
    }
  },

  bs: {
    title: 'Ahmed Grabus · Softverski inženjer',
    desc: 'Ahmed Grabus (Graba), softverski inženjer iz Bosne i Hercegovine. Brze i lijepe web stranice i full-stack proizvodi.',
    nav: { work: 'Radovi', services: 'Usluge', process: 'Proces', about: 'O meni' },
    copy: 'Kopiraj email', copied: 'Email kopiran',
    workK: 'Izabrani radovi', workH: 'Stvari koje sam dizajnirao, napravio i *objavio.*',
    view: 'Pogledaj', live: 'Otvori stranicu', code: 'Kod', liveTag: 'Uživo',
    items: {
      myshishapedia: ['MyShishapedia', 'Web aplikacija · Enciklopedija', 'Dvojezična enciklopedija okusa za nargile: sastojci, profili okusa, poređenja, mikser i kviz. Vlastiti generator unaprijed pravi 190+ stranica, uz pametnu pretragu i kartice za dijeljenje.'],
      squadjury: ['SquadJury', 'Web aplikacija · Fantasy fudbal', 'Igrači Fantasy Premier Leaguea objave svoj tim jednim screenshotom, a zajednica ga ocijeni od 1 do 10 prije deadlinea. Tim se čita u pregledniku (OCR), uz duele, privatne lige, stvarne bodove poslije kola i značke. Cijeli sistem na Cloudflare Workers, D1 i R2.'],
      salon: ['Glaze Nail Studio', 'Web stranica · Salon za nokte', 'Stranica za salon za nokte: isprobavanje boje, oblika i stila na realistično nacrtanoj ruci u SVG-u, galerija dizajna po stilu i godišnjem dobu, prijedlog nijanse uz fotografiju outfita i upit za termin na Viber ili WhatsApp u tri koraka. Tri jezika, može se instalirati kao aplikacija.'],
      svecana: ['Svečana sala', 'Web stranica · Svadbeni salon', 'Demo stranica za svadbene salone: kalendar slobodnih datuma povezan sa Google Kalendarom preko Cloudflare Workera, okvirna cijena odmah, upit na Viber, zakazivanje razgledanja i stranica za goste sa QR kodom.'],
      mostar: ['Old Bridge Mostar', 'Web stranica · Priča na skrol', 'Filmska priča o Mostaru dok skrolate. Slojevite SVG scene Starog mosta i Neretve, skakač sa mosta i beskonačna lista mjesta, sve nacrtano u kodu.'],
      planinka: ['Planinka', 'Web stranica · Vikendica', 'Stranica za vikendicu na Vlašiću: sezonske cijene sa kalkulatorom, vrijeme uživo, galerija i upit za rezervaciju na Viber ili WhatsApp. Bosanski, engleski i njemački.'],
      grabpoints: ['GrabPoints', 'Proizvod · Fantasy fudbal', 'Pomoćnik za Fantasy Premier League sa ML predviđanjima bodova, kapitena i transfera. .NET 10 API i worker preko RabbitMQ-a, Flutter mobilna aplikacija i desktop admin.'],
      lounge: ['Exclusive Lounge', 'Aplikacija uživo · Rezervacije', 'Aplikacija za rezervaciju stolova za Exclusive Caffe Lounge, dostupna online: gost bira event i tačno svoj sto na interaktivnoj mapi sale. Admin panel, spisak gostiju u PDF-u i Telegram obavještenje vlasniku za svaku rezervaciju.'],
      apoteke: ['Dežurne apoteke BiH', 'Web aplikacija · PWA', 'Pokazuje koje apoteke su trenutno dežurne u Bosni i Hercegovini, sa udaljenošću, pozivom jednim dodirom i navigacijom.']
    },
    servK: 'Usluge', servH: 'Šta mogu uraditi za *vas.*',
    services: [
      ['Web stranice za biznise', 'Vikendice, svadbeni saloni, saloni ljepote, restorani i radnje. Brze stranice prilagođene mobitelu, na kojima kupci za par sekundi provjere termin i jave vam se.'],
      ['Full-stack proizvodi', 'Web aplikacije od baze do interfejsa: .NET i Java backend, Angular, React i Next.js frontend, čista arhitektura.'],
      ['Mobilne aplikacije', 'Aplikacije u Flutteru za Android i iOS, povezane sa vašim API-jem, sa istom pažnjom na detalje kao web.'],
      ['Brzina, SEO i održavanje', 'Stranice koje se brzo učitaju, nađu se na Googleu i rade bez problema. Mogu se brinuti i o izmjenama kad stranica proradi.']
    ],
    procK: 'Proces', procH: 'Jednostavno, direktno, *bez iznenađenja.*',
    process: [
      ['Kratak razgovor', 'Pričamo o tome šta vam treba, ko su vaši kupci i šta stranica treba da radi.'],
      ['Prva verzija', 'Radnu verziju stranice vidite za nekoliko dana, ne sedmica.'],
      ['Doradimo zajedno', 'Sređujemo tekstove, slike i detalje dok ne bude baš kako treba.'],
      ['Objava i podrška', 'Stranica ide na vašu domenu. Za izmjene je dovoljna jedna poruka.']
    ],
    aboutK: 'O meni', aboutH: 'Softverski inženjer kojem su bitni *detalji.*',
    aboutP: ['Pravim proizvode od početka do kraja, od baze do zadnje animacije. Radim full-stack softver i pravim web stranice koje lokalnim biznisima pomažu da ih gosti nađu i rezervišu.', 'Bitni su mi čista arhitektura, stvarna brzina i interfejsi koje je prijatno koristiti.'],
    facts: [['Dostupan za', 'Nove projekte'], ['Iz', 'Bosna i Hercegovina'], ['Fokus', 'Web, full-stack, mobilne aplikacije'], ['Jezici', 'Bosanski, engleski']],
    stackK: 'Alati koje koristim',
    contactK: 'Kontakt', contactH: 'Napravimo nešto *dobro.*',
    contactP: 'Pišite mi o ideji, biznisu ili projektu za koji vam treba pomoć. Obično odgovorim istog dana.',
    email: 'Email', phone: 'Telefon', viber: 'Viber', whatsapp: 'WhatsApp', github: 'GitHub',
    foot: 'Dizajnirao i napravio Ahmed Grabus.',
    credit: 'Soba inspirisana radom',
    role: 'Softverski inženjer',
    hero: 'Pravim brze i lijepe web stranice i full-stack proizvode, od baze do zadnje animacije.',
    site: {
      skip: 'Preskoči na sadržaj',
      tabs: { work: 'Radovi', services: 'Usluge', about: 'O meni', contact: 'Kontakt' },
      avail: 'Dostupan za nove projekte', place: 'Bosna i Hercegovina', navLabel: 'Dijelovi stranice',
      roomT: 'Uđi u moju sobu', roomP: '3 ujutro, akvarijum, stari računar', prev: 'Prethodni projekat', next: 'Sljedeći projekat'
    },
    room: {
      loading: 'Učitavam projekte...', press: 'PRITISNI BILO KOJU TIPKU', tap: 'DODIRNI ZA START', nogl: 'Ova soba traži WebGL. Otvaram klasičnu verziju.',
      hintD: 'Klikni bilo šta · prevuci za pogled · WASD za hod', hintM: 'Dodirni bilo šta · prevuci za pogled · krug za hod',
      reset: 'Vrati početni pogled', showNames: 'Prikaži sva imena',
      back: 'Nazad', classic: 'Klasična verzija', room: 'Uđi u sobu', soundOn: 'Zvuk uključen', soundOff: 'Zvuk isključen', lang: 'Jezik',
      names: { monitor: 'Projekti', phone: 'Kontakt', answering: 'O meni', coffee: 'Idemo na kafu', notes: 'Usluge', floppies: 'Vremenska linija', poster: 'Skoči.', aquarium: 'Akvarijum', lamp: 'Stona lampa', cassette: 'Zvuk', keyboard: 'Tehnologije' },
      objs: { monitor: 'Stari računar', phone: 'Crveni telefon', answering: 'Telefonska sekretarica', coffee: 'Džezva i fildžan', notes: 'Ceduljice', floppies: 'Diskete', poster: 'Plakat', aquarium: 'Akvarijum', lamp: 'Stona lampa', cassette: 'Kasetofon', keyboard: 'Tastatura' },
      lampOn: 'Svjetlo upaljeno', lampOff: 'Svjetlo ugašeno', fish: 'Ribice su se razbježale. Vratit će se.',
      programs: 'Programi', run: 'Otvori uživo', source: 'Kod', all: 'Svi programi', loadingExe: 'UČITAVAM', noLive: 'Samo kod',
      termHint: 'Upiši help i pritisni Enter', termLabel: 'Komanda za terminal',
      ring: 'Zvoni', dial: 'Biram', callH: 'Podigni slušalicu', call: 'Pozovi', copyEmail: 'Kopiraj email',
      amNew: '1 NOVA PORUKA', amPlay: 'Pusti poruku ponovo', amFrom: 'Od: Graba',
      coffeeH: 'Idemo na kafu', coffeeP: 'Primakni stolicu. Pričaj mi o ideji, biznisu ili projektu za koji ti treba pomoć, uz bosansku kafu ili online. Obično odgovorim istog dana.', coffeeCta: 'Pošalji poruku',
      timelineH: 'Vremenska linija', timelineP: 'Izaberi disketu da učitaš godinu.', disk: 'Disketa',
      stackP: 'Tipke koje najčešće pritišćem.',
      servP: 'Ceduljice na monitoru, da nikad ne zaboravim.',
      posterP: 'Skakači sa Starog mosta u Mostaru skaču. Možeš i ti: pokreni projekat koji stalno odgađaš.'
    },
    term: {
      boot: ['GRABA OS v1.0', 'Upiši help i pritisni Enter.'],
      help: ['help            ova lista', 'projects        svi programi', 'open <ime>      pokreni program (open glaze)', 'whoami          ko ovdje živi', 'contact         kako do mene', 'services        šta mogu uraditi za vas', 'stack           alati koje koristim', 'coffee          pauza za kafu', 'skoci           skoči', 'lang en|bs      promijeni jezik', 'history         zadnje komande', 'clear           očisti ekran', 'exit            ustani od računara'],
      unknown: 'Nepoznata komanda: ', notFound: 'Nema takvog programa: ', opening: 'Pokrećem ', coffee: ['  ( (', '   ) )', ' ........', ' |      |]', ' \\      /', '  `----\'', 'Kafa je spremna. Piši mi pa da pričamo.'],
      skoci: ['3...', '2...', '1...', 'SKOČI!', '  \\o/', '   |', '  / \\', '~~~~~~ pljus ~~~~~~'], empty: 'Još nema komandi.', bye: 'Ćao.'
    }
  }
};
