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
  work: [
    { id: 'myshishapedia', year: '2025', img: 'assets/work/myshishapedia.jpg', live: 'https://myshishapedia.com', src: 'https://github.com/grabator/myshishapedia', tags: ['JavaScript', 'Node.js', 'SVG', 'Cloudflare Pages'] },
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
    touch: 'Get in touch', menu: 'Menu', close: 'Close',
    blur1: 'Hey there, I\'m Ahmed Grabus,',
    blur2: 'a software engineer from Bosnia and Herzegovina',
    type: 'Good to see you here. I build fast, beautiful websites and full-stack products. So, what are we building?',
    pills: ['See my work', 'Start a project', 'Give me a call', 'Message on Viber'],
    reach: 'Reach me:', copy: 'Copy email', copied: 'Email copied',
    scrub: 'Move your mouse, click him', tapBot: 'Tap him, he knows tricks',
    workK: 'Selected work', workH: 'Things I designed, built and *shipped.*',
    view: 'View', live: 'Live site', code: 'Source', liveTag: 'Live',
    items: {
      myshishapedia: ['MyShishapedia', 'Web app · Encyclopedia', 'A bilingual hookah flavor encyclopedia: ingredient breakdowns, flavor profiles, comparisons, a mixer and a quiz. A custom static site generator prerenders 190+ pages, with fuzzy search and shareable story cards.'],
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
    foot: 'Designed and built by Ahmed Grabus.', top: 'Back to top',
    sheetP: 'Prefer a quick chat? Call or message me directly.', swipe: 'Swipe',
    bot: {
      hi: 'Hi there!', wake: 'Oops, I am awake!', dizzy: 'Whoa, I am dizzy...',
      tricks: ['Hehe, that tickles!', 'Wheee!', 'I like you already.', 'Compiling...', 'Psst, check my work.'],
      pills: ['The good stuff is below.', 'Tell me your idea!', 'Ring ring!', 'Viber works great.', 'Copy it and write to me.']
    }
  },

  bs: {
    title: 'Ahmed Grabus · Softverski inženjer',
    desc: 'Ahmed Grabus (Graba), softverski inženjer iz Bosne i Hercegovine. Brze i lijepe web stranice i full-stack proizvodi.',
    nav: { work: 'Radovi', services: 'Usluge', process: 'Proces', about: 'O meni' },
    touch: 'Javite se', menu: 'Meni', close: 'Zatvori',
    blur1: 'Pozdrav, ja sam Ahmed Grabus,',
    blur2: 'softverski inženjer iz Bosne i Hercegovine',
    type: 'Drago mi je što ste tu. Pravim brze i lijepe web stranice i full-stack proizvode. Šta pravimo?',
    pills: ['Pogledaj radove', 'Pokreni projekat', 'Pozovi me', 'Piši na Viber'],
    reach: 'Pišite mi:', copy: 'Kopiraj email', copied: 'Email kopiran',
    scrub: 'Pomjeri miš, klikni ga', tapBot: 'Dodirni ga, zna trikove',
    workK: 'Izabrani radovi', workH: 'Stvari koje sam dizajnirao, napravio i *objavio.*',
    view: 'Pogledaj', live: 'Otvori stranicu', code: 'Kod', liveTag: 'Uživo',
    items: {
      myshishapedia: ['MyShishapedia', 'Web aplikacija · Enciklopedija', 'Dvojezična enciklopedija okusa za nargile: sastojci, profili okusa, poređenja, mikser i kviz. Vlastiti generator unaprijed pravi 190+ stranica, uz pametnu pretragu i kartice za dijeljenje.'],
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
    foot: 'Dizajnirao i napravio Ahmed Grabus.', top: 'Na vrh',
    sheetP: 'Brže je uživo? Pozovite ili pišite direktno.', swipe: 'Prevuci',
    bot: {
      hi: 'Zdravo!', wake: 'Ups, budan sam!', dizzy: 'Joj, vrti mi se...',
      tricks: ['Hehe, škaklja!', 'Juhuuu!', 'Već mi se sviđaš.', 'Kompajliram...', 'Pst, pogledaj radove.'],
      pills: ['Najbolje je dole.', 'Pričaj mi ideju!', 'Zvoni, zvoni!', 'Viber radi odlično.', 'Kopiraj i piši mi.']
    }
  }
};
