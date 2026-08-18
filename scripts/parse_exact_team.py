import urllib.request
import re
import os

url = "https://sprachcafe-polnisch.org/ueber-uns/team/"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')

out_img_dir = "/home/ubuntu/sprachcafe-relaunch/frontend/public/images/team"
out_md_dir = "/home/ubuntu/sprachcafe-relaunch/frontend/src/content/team"
os.makedirs(out_img_dir, exist_ok=True)
os.makedirs(out_md_dir, exist_ok=True)

# Precise dictionary of members
members = [
    # 1. Vorstand
    {
        "name": "Agata Koch",
        "slug": "01-agata-koch",
        "category": "vorstand",
        "order": 1,
        "role_de": "Vorstandsvorsitzende & Gründerin",
        "role_pl": "Przewodnicząca Zarządu i Założycielka",
        "role_en": "Chairwoman & Founder",
        "bio_de": "Vorsitzende: Koordination, Kommunikation, Kreativität. Gründerin des SprachCafé Polnisch e.V. seit 2008.",
        "bio_pl": "Przewodnicząca: Koordynacja, komunikacja, kreatywność. Założycielka stowarzyszenia w 2008 r.",
        "bio_en": "Chairwoman: Coordination, communication, creativity. Founder of the association since 2008.",
        "email": "a.koch@sprachcafe-polnisch.org",
        "img_url": "https://sprachcafe-polnisch.org/wp-content/uploads/2026/07/Agata-Koch-Headshot-2026-683x1024.avif"
    },
    {
        "name": "Elke Albers",
        "slug": "02-elke-albers",
        "category": "vorstand",
        "order": 2,
        "role_de": "Vorstandsmitglied & Schatzmeisterin",
        "role_pl": "Skarbnik i Członkini Zarządu",
        "role_en": "Board Member & Treasurer",
        "bio_de": "Schatzmeisterin, Finanzverwaltung und Fundraising.",
        "bio_pl": "Skarbnik, finanse oraz fundraising.",
        "bio_en": "Treasurer, financial management, and fundraising.",
        "email": "e.albers@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2022/08/Elke-Albers-Foto-Elke-Albers.jpg?resize=300%2C300&ssl=1"
    },
    {
        "name": "Agnieszka Ghanname",
        "slug": "03-agnieszka-ghanname",
        "category": "vorstand",
        "order": 3,
        "role_de": "Vorstandsmitglied & Sozialberatung",
        "role_pl": "Zarząd i Poradnictwo Społeczne",
        "role_en": "Board Member & Social Counseling",
        "bio_de": "Vorstandsmitglied, Leitung der muttersprachlichen Sozialberatung und Kinderpädagogin.",
        "bio_pl": "Członkini zarządu, poradnictwo społeczne i pedagogika dziecięca.",
        "bio_en": "Board member, social counseling lead, and childhood educator.",
        "email": "a.ghanname@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2024/08/team-Agnieszka-Ghanname-150x150.webp?resize=300%2C300&ssl=1"
    },
    {
        "name": "Sandra Filip-Badura",
        "slug": "04-sandra-filip-badura",
        "category": "vorstand",
        "order": 4,
        "role_de": "Vorstandsmitglied & Polnisch als Fremdsprache",
        "role_pl": "Zarząd i Język Polski jako Obcy",
        "role_en": "Board Member & Polish as Foreign Language",
        "bio_de": "Konzeption und Koordination der Sprachkurse Polnisch als Fremdsprache für Erwachsene.",
        "bio_pl": "Koncepcja i koordynacja kursów języka polskiego jako obcego dla dorosłych.",
        "bio_en": "Concept and coordination of Polish as a foreign language courses for adults.",
        "email": "s.filip-badura@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2021/01/team-Sandra-Filip-Badura.jpg?resize=300%2C300&ssl=1"
    },
    {
        "name": "Katarzyna Aniela Koziol",
        "slug": "05-katarzyna-koziol",
        "category": "vorstand",
        "order": 5,
        "role_de": "Dipl.-Päd., Holistisches Coaching",
        "role_pl": "Pedagog, Coaching Holistyczny",
        "role_en": "Dipl.-Ped., Holistic Coaching",
        "bio_de": "Holistisches Coaching: Karriere, Business & Mindset.",
        "bio_pl": "Coaching holistyczny: kariera, biznes i rozwój osobisty.",
        "bio_en": "Holistic coaching: career, business, and mindset.",
        "email": "hallo@kasia-aniela-koziol.de",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2025/10/DSC06751-150x150.webp?resize=300%2C300&ssl=1"
    },

    # 2. Verwaltung
    {
        "name": "Agnieszka Kubalewska-Strohmeyer",
        "slug": "06-agnieszka-kubalewska",
        "category": "verwaltung",
        "order": 6,
        "role_de": "Buchhaltung & Verwaltung",
        "role_pl": "Księgowość i Administracja",
        "role_en": "Accounting & Administration",
        "bio_de": "Buchhaltung, Projektmittelabrechnung und Vereinsverwaltung.",
        "bio_pl": "Księgowość, rozliczanie projektów i administracja stowarzyszenia.",
        "bio_en": "Accounting, grant settlement, and association administration.",
        "email": "verwaltung@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2026/05/Silver.webp?resize=300%2C300&ssl=1"
    },
    {
        "name": "Dorota Stasińska",
        "slug": "07-dorota-stasinska",
        "category": "verwaltung",
        "order": 7,
        "role_de": "BundesFreiwillige & Empfang",
        "role_pl": "Wolontariat BFD i Recepcja",
        "role_en": "Federal Volunteer & Reception",
        "bio_de": "Koordination vor Ort in der Schulzestraße und Mitgliederbetreuung.",
        "bio_pl": "Koordynacja na miejscu przy Schulzestraße i obsługa członków.",
        "bio_en": "On-site coordination at Schulzestraße and member relations.",
        "email": "d.stasinska@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2025/05/IMG_9989-scaled.webp?resize=300%2C300&ssl=1"
    },
    {
        "name": "Philipp Fuchs",
        "slug": "08-philipp-fuchs",
        "category": "verwaltung",
        "order": 8,
        "role_de": "IT & Digitale Infrastruktur",
        "role_pl": "IT i Cyfryzacja",
        "role_en": "IT & Digital Infrastructure",
        "bio_de": "Entwicklung und Betreuung des Astro-Webportals, der Hausbibliothek und der M365-Workflows.",
        "bio_pl": "Tworzenie i opieka nad portalem Astro, biblioteką cyfrową oraz procesami M365.",
        "bio_en": "Development and maintenance of the Astro portal, digital library, and M365 workflows.",
        "email": "p.fuchs@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2025/05/IMG_0157-150x150.webp?resize=300%2C300&ssl=1"
    },

    # 3. Pädagog:innen
    {
        "name": "Leokadia Rospek",
        "slug": "09-leokadia-rospek",
        "category": "paedagogik",
        "order": 9,
        "role_de": "Kinderpädagogin (Klub Malucha)",
        "role_pl": "Pedagog Dziecięcy (Klub Malucha)",
        "role_en": "Childhood Educator (Toddler Club)",
        "bio_de": "Sensorisch-kreative Frühförderung für Kleinkinder (1–3 Jahre) in Schöneberg und Köpenick.",
        "bio_pl": "Sensoryczno-kreatywne zajęcia dla maluchów w Schöneberg i Köpenick.",
        "bio_en": "Sensory-creative early education for toddlers in Schöneberg and Köpenick.",
        "email": "l.rospek@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2026/02/Leokadia.webp?resize=300%2C300&ssl=1"
    },
    {
        "name": "Grzegorz Szklarczuk",
        "slug": "10-grzegorz-szklarczuk",
        "category": "paedagogik",
        "order": 10,
        "role_de": "Kinderpädagoge & Medien",
        "role_pl": "Pedagog Dziecięcy i Media",
        "role_en": "Childhood Educator & Media",
        "bio_de": "Medienpädagogik, Film- und Sprachprojekte für Kinder und Jugendliche.",
        "bio_pl": "Pedagogika medialna, projekty filmowe i językowe dla dzieci i młodzieży.",
        "bio_en": "Media pedagogy, film and language projects for children and youth.",
        "email": "g.szklarczuk@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2024/08/WhatsApp-Bild-2024-08-05-um-11.48.57_2556fe01-1-150x150-1.webp?resize=300%2C300&ssl=1"
    },
    {
        "name": "Magdalena Wadas",
        "slug": "11-magdalena-wadas",
        "category": "paedagogik",
        "order": 11,
        "role_de": "Kinderpädagogin & Koordination Schöneberg",
        "role_pl": "Pedagog Dziecięcy i Koordynacja Schöneberg",
        "role_en": "Childhood Educator & Schöneberg Lead",
        "bio_de": "Kinderpädagogik und Koordination der Angebote in Berlin-Schöneberg.",
        "bio_pl": "Pedagogika dziecięca i koordynacja w Berlinie Schöneberg.",
        "bio_en": "Childhood education and coordination in Berlin Schöneberg.",
        "email": "m.wadas@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2023/08/20230703_100351-scaled-e1691765200572-150x150.jpg?resize=300%2C300&ssl=1"
    },
    {
        "name": "Karolina Żuczek",
        "slug": "12-karolina-zuczek",
        "category": "paedagogik",
        "order": 12,
        "role_de": "Kinderpädagogin & Kreativwerkstatt",
        "role_pl": "Pedagog Dziecięcy i Warsztaty Twórcze",
        "role_en": "Childhood Educator & Creative Arts",
        "bio_de": "Kreatives Gestalten, Kunstpädagogik und Vorleseformate.",
        "bio_pl": "Zajęcia plastyczne, pedagogika twórczości i czytanie bajek.",
        "bio_en": "Creative arts, art pedagogy, and storytelling.",
        "email": "k.zuczek@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2024/10/WhatsApp-Bild-2024-08-30-um-09.40.14_0e4c97c3-150x150.webp?resize=300%2C300&ssl=1"
    },
    {
        "name": "Joanna Ceremuga",
        "slug": "13-joanna-ceremuga",
        "category": "paedagogik",
        "order": 13,
        "role_de": "Mehrsprachigkeit & Englisch",
        "role_pl": "Wielojęzyczność i Język Angielski",
        "role_en": "Multilingualism & English",
        "bio_de": "Mehrsprachige Sprachanimation und spielerische Englischförderung.",
        "bio_pl": "Wielojęzyczna animacja językowa i nauka angielskiego przez zabawę.",
        "bio_en": "Multilingual language animation and playful English tutoring.",
        "email": "j.ceremuga@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2024/09/JoannaCeremuga.Archiwumwlasne-150x150-1.webp?resize=300%2C300&ssl=1"
    },
    {
        "name": "Basia Stillmark",
        "slug": "14-basia-stillmark",
        "category": "paedagogik",
        "order": 14,
        "role_de": "Kinderpädagogin & Musik",
        "role_pl": "Pedagog Dziecięcy i Muzyka",
        "role_en": "Childhood Educator & Music",
        "bio_de": "Musikalische Früherziehung, Singen und Rhythmik.",
        "bio_pl": "Wczesna edukacja muzyczna, śpiew i rytmika.",
        "bio_en": "Early music education, singing, and rhythmics.",
        "email": "b.stillmark@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2022/08/Basia-enface-1.jpg?resize=300%2C300&ssl=1"
    },
    {
        "name": "Dr. Lilian Vázquez Sandoval",
        "slug": "15-dr-lilian-vazquez",
        "category": "paedagogik",
        "order": 15,
        "role_de": "Mehrsprachigkeit & Film",
        "role_pl": "Wielojęzyczność i Film",
        "role_en": "Multilingualism & Film",
        "bio_de": "Kulturelle Filmreihen, mehrsprachige Filmdiskussionen und Bildungsangebote.",
        "bio_pl": "Cykle filmowe, dyskusje o kinie i projekty edukacyjne.",
        "bio_en": "Cultural film series, film discussions, and educational projects.",
        "email": "l.vazquez-sandoval@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2023/05/Lilian_IFA5.png?resize=300%2C300&ssl=1"
    },
    {
        "name": "Linda Kutzner",
        "slug": "16-linda-kutzner",
        "category": "paedagogik",
        "order": 16,
        "role_de": "Kinderpädagogin",
        "role_pl": "Pedagog Dziecięcy",
        "role_en": "Childhood Educator",
        "bio_de": "Pädagogische Begleitung von Spiel- und Lerngruppen im SprachCafé.",
        "bio_pl": "Opieka pedagogiczna nad grupami zabawowymi i edukacyjnymi.",
        "bio_en": "Pedagogical support for play and learning groups.",
        "email": "kontakt@sprachcafe-polnisch.org",
        "img_url": "https://sprachcafe-polnisch.org/wp-content/uploads/2026/07/linda-ig-1-edited.avif"
    },
    {
        "name": "Natalia Abend",
        "slug": "17-natalia-abend",
        "category": "paedagogik",
        "order": 17,
        "role_de": "Sprachdozentin (Polnisch)",
        "role_pl": "Lektorka Języka Polskiego",
        "role_en": "Polish Language Instructor",
        "bio_de": "Sprachkurse und Konversationstraining für Erwachsene.",
        "bio_pl": "Kursy językowe i trening konwersacyjny dla dorosłych.",
        "bio_en": "Language courses and conversation training for adults.",
        "email": "natalia.abend@gmx.de",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2022/08/Natalia-Abend-Foto-Michael-Abend.jpg?resize=300%2C300&ssl=1"
    },

    # 4. Literatur
    {
        "name": "Natalia Prüfer",
        "slug": "18-natalia-pruefer",
        "category": "literatur",
        "order": 18,
        "role_de": "Literatur & Öffentlichkeitsarbeit",
        "role_pl": "Literatura i Public Relations",
        "role_en": "Literature & Public Relations",
        "bio_de": "Autorenlesungen, literarische Salons und Pressearbeit.",
        "bio_pl": "Spotkania autorskie, salony literackie i relacje z prasą.",
        "bio_en": "Author readings, literary salons, and press relations.",
        "email": "n.pruefer@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2025/02/1-01.02.25-scaled.webp?resize=300%2C300&ssl=1"
    },
    {
        "name": "Natalie Wasserman",
        "slug": "19-natalie-wasserman",
        "category": "literatur",
        "order": 19,
        "role_de": "Kreatives Schreiben",
        "role_pl": "Kreatywne Pisanie",
        "role_en": "Creative Writing",
        "bio_de": "Leitung von Schreibwerkstätten für mehrsprachige Lyrik und Prosa.",
        "bio_pl": "Prowadzenie warsztatów pisarskich poezji i prozy.",
        "bio_en": "Creative writing workshops for multilingual poetry and prose.",
        "email": "n.wasserman@web.de",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2024/08/team-Natalie-Wasserman-150x150-1-jpg.webp?resize=300%2C300&ssl=1"
    },
    {
        "name": "Małgorzata Kamińska",
        "slug": "20-malgorzata-kaminska",
        "category": "literatur",
        "order": 20,
        "role_de": "Introspektives Schreiben & Meditation",
        "role_pl": "Pisanie Introspektywne i Medytacja",
        "role_en": "Introspective Writing & Meditation",
        "bio_de": "Achtsamkeitsorientierte Schreib- und Meditationsabende.",
        "bio_pl": "Wieczory uważności, pisania terapeutycznego i medytacji.",
        "bio_en": "Mindfulness-oriented reflective writing and meditation evenings.",
        "email": "m.rubaszewska@wp.pl",
        "img_url": "/images/team/avatar-default.svg"
    },
    {
        "name": "Katarzyna Habas",
        "slug": "21-katarzyna-habas",
        "category": "literatur",
        "order": 21,
        "role_de": "Projektmanagerin Kultur",
        "role_pl": "Menedżerka Projektów Kultury",
        "role_en": "Cultural Project Manager",
        "bio_de": "Planung und Durchführung von Kulturprojekten und Lesefestivals.",
        "bio_pl": "Planowanie i realizacja projektów kulturalnych oraz festiwali.",
        "bio_en": "Planning and execution of cultural projects and festivals.",
        "email": "k.habas@sprachcafe-polnisch.org",
        "img_url": "https://sprachcafe-polnisch.org/wp-content/uploads/2026/02/katarzyna_habas-scaled.webp"
    },

    # 5. Kunst & Kreatives
    {
        "name": "Aleksandra Gajda",
        "slug": "22-aleksandra-gajda",
        "category": "kunst",
        "order": 22,
        "role_de": "Künstlerin & KunstWorkshops",
        "role_pl": "Artystka i Warsztaty Sztuki",
        "role_en": "Artist & Art Workshops",
        "bio_de": "Künstlerische Workshops, Malerei und experimentelle Gestaltungskurse.",
        "bio_pl": "Warsztaty artystyczne, malarstwo i kursy eksperymentalne.",
        "bio_en": "Artistic workshops, painting, and experimental visual arts.",
        "email": "aleksandragajda.art@gmail.com",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2021/04/Aleksandra-G.jpeg?resize=300%2C300&ssl=1"
    },
    {
        "name": "Małgorzata Reszka-Matthes",
        "slug": "23-malgorzata-reszka-matthes",
        "category": "kunst",
        "order": 23,
        "role_de": "Kinderpädagogin & Künstlerin",
        "role_pl": "Pedagog Dziecięcy i Artystka",
        "role_en": "Childhood Educator & Artist",
        "bio_de": "Gestaltungskurse, handwerkliche Kunstformate und Ausstellungsbetreuung.",
        "bio_pl": "Warsztaty plastyczne, rzemiosło i opieka nad wystawami.",
        "bio_en": "Art courses, handicraft formats, and exhibition curation.",
        "email": "m.reszka-matthes@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2025/10/thumbnail_ddaaf858-ab49-4266-9cfb-147baba6d58d.webp?resize=300%2C300&ssl=1"
    },
    {
        "name": "Dr. Jean-François Renault / JP Bouzac",
        "slug": "24-jean-francois-renault",
        "category": "kunst",
        "order": 24,
        "role_de": "Galerie, Nachhaltigkeit & Französisch",
        "role_pl": "Galeria, Zrównoważony Rozwój i Język Francuski",
        "role_en": "Gallery, Sustainability & French",
        "bio_de": "Kuration von Ausstellungen zu Nachhaltigkeit & Menschenwürde, Französisch-Treffen.",
        "bio_pl": "Kuratela wystaw o prawach człowieka i ekologii oraz spotkania francuskie.",
        "bio_en": "Exhibition curation on human rights, sustainability, and French language meetups.",
        "email": "jfrenault@gmail.com",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2023/05/JF-Renault-1.jpg?resize=300%2C300&ssl=1"
    },

    # 6. Arbeitsmarkt & Business
    {
        "name": "Małgorzata Hoffmann, DBA",
        "slug": "25-malgorzata-hoffmann",
        "category": "business",
        "order": 25,
        "role_de": "Doctor of Business Administration (KI & Marketing)",
        "role_pl": "Doctor of Business Administration (AI i Marketing)",
        "role_en": "Doctor of Business Administration (AI & Marketing)",
        "bio_de": "Workshops zu Künstlicher Intelligenz, Marketing & Karriereentwicklung.",
        "bio_pl": "Warsztaty ze sztucznej inteligencji, marketingu i rozwoju kariery.",
        "bio_en": "Workshops on Artificial Intelligence, marketing, and career restart.",
        "email": "academy.ai.berlin@gmail.com",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2025/01/Zdjecie-profilowe-1.webp?resize=300%2C300&ssl=1"
    },

    # 7. Technik
    {
        "name": "Andrzej Konieczny",
        "slug": "26-andrzej-konieczny",
        "category": "technik",
        "order": 26,
        "role_de": "Facility Management & Haustechnik",
        "role_pl": "Złota Rączka i Obsługa Techniczna",
        "role_en": "Facility Management & Handyman",
        "bio_de": "Alleskönner in der Schulze: Instandhaltung, Holzbau und Ausstellungsaufbau.",
        "bio_pl": "Złota rączka w Schulzestraße: konserwacja, drewno i montaż wystaw.",
        "bio_en": "Master craftsman at Schulze: maintenance, woodworking, and exhibition setup.",
        "email": "andrzejkonieczny702@gmail.com",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2022/08/Andrzej-Konieczny-Foto-A.K..jpg?resize=300%2C300&ssl=1"
    },
    {
        "name": "Michał Kamiński",
        "slug": "27-michal-kaminski",
        "category": "technik",
        "order": 27,
        "role_de": "Veranstaltungstechnik & Ton",
        "role_pl": "Technika Estradowa i Nagłośnienie",
        "role_en": "Event Technology & Audio",
        "bio_de": "Ton- und Bühnentechnik bei Konzerten, Lesungen und Festivals.",
        "bio_pl": "Obsługa nagłośnienia i oświetlenia podczas wydarzeń.",
        "bio_en": "Audio and stage technology for concerts, readings, and festivals.",
        "email": "aqustick@wp.pl",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2022/08/IMG_1086-Michal-2.jpg?resize=300%2C300&ssl=1"
    },

    # 8. Bundesfreiwilligendienst (BFD)
    {
        "name": "Dayna Welch",
        "slug": "28-dayna-welch",
        "category": "bfd",
        "order": 28,
        "role_de": "Bundesfreiwilligendienst (BFD)",
        "role_pl": "Wolontariat Federalny (BFD)",
        "role_en": "Federal Volunteer (BFD)",
        "bio_de": "Mitarbeit im Begegnungscafé, bei Veranstaltungen und Sprachgruppen.",
        "bio_pl": "Praca w kawiarni spotkań, przy wydarzeniach i grupach językowych.",
        "bio_en": "Support in the community café, event coordination, and language groups.",
        "email": "d.welch@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2025/05/WhatsApp-Bild-2025-05-06-um-10.59.01_5b67fc0a.webp?resize=300%2C300&ssl=1"
    },
    {
        "name": "Agata Serwińska",
        "slug": "29-agata-serwinska",
        "category": "bfd",
        "order": 29,
        "role_de": "Bundesfreiwilligendienst (BFD)",
        "role_pl": "Wolontariat Federalny (BFD)",
        "role_en": "Federal Volunteer (BFD)",
        "bio_de": "Unterstützung der Hausbibliothek, Kiezprojekte und Sprachrunden.",
        "bio_pl": "Wsparcie biblioteki, projektów sąsiedzkich i spotkań językowych.",
        "bio_en": "Support for the library, neighborhood projects, and language meetups.",
        "email": "kontakt@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2023/12/IMG-20231219-WA0003-150x150.webp?resize=300%2C300&ssl=1"
    }
]

def get_photo(url, slug):
    if not url or url.startswith("/images/"):
        return url or "/images/team/avatar-default.svg"
    
    ext = ".jpg"
    if ".webp" in url:
        ext = ".webp"
    elif ".png" in url:
        ext = ".png"
    elif ".avif" in url:
        ext = ".avif"
    elif ".jpeg" in url:
        ext = ".jpeg"
    
    filename = f"{slug}{ext}"
    local_path = os.path.join(out_img_dir, filename)
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as resp, open(local_path, 'wb') as f:
            f.write(resp.read())
        print(f"✓ Downloaded image: {filename}")
        return f"/images/team/{filename}"
    except Exception as e:
        print(f"⚠️ Failed to download image for {slug}: {e}")
        return "/images/team/avatar-default.svg"

for m in members:
    photo = get_photo(m["img_url"], m["slug"])
    
    content = f"""---
name: "{m['name']}"
category: "{m['category']}"
role:
  de: "{m['role_de']}"
  pl: "{m['role_pl']}"
  en: "{m['role_en']}"
contact:
  email: "{m['email']}"
photo: "{photo}"
bio:
  de: "{m['bio_de']}"
  pl: "{m['bio_pl']}"
  en: "{m['bio_en']}"
order: {m['order']}
---
"""
    file_path = os.path.join(out_md_dir, f"{m['slug']}.md")
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"✓ Saved markdown: {m['slug']}.md")

print(f"\n🎉 Successfully parsed and populated all {len(members)} team entries!")
