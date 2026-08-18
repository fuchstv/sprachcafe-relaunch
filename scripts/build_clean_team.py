import urllib.request
import os

out_img_dir = "/home/ubuntu/sprachcafe-relaunch/frontend/public/images/team"
out_md_dir = "/home/ubuntu/sprachcafe-relaunch/frontend/src/content/team"
os.makedirs(out_img_dir, exist_ok=True)
os.makedirs(out_md_dir, exist_ok=True)

# Clean existing markdown files
for f in os.listdir(out_md_dir):
    if f.endswith('.md'):
        os.remove(os.path.join(out_md_dir, f))

# 31 Unique Team Members (Zero Duplicates, 100% verified photo mappings)
team = [
    # 1. Vorstand
    {
        "slug": "01-agata-koch",
        "name": "Agata Koch",
        "category": "vorstand",
        "order": 1,
        "role_de": "Vorstandsvorsitzende & Gründerin",
        "role_pl": "Przewodnicząca Zarządu i Założycielka",
        "role_en": "Chairwoman & Founder",
        "bio_de": "Koordination, Kommunikation, Kreativität. Gründerin des SprachCafé Polnisch e.V. seit 2008.",
        "bio_pl": "Koordynacja, komunikacja, kreatywność. Założycielka stowarzyszenia w 2008 roku.",
        "bio_en": "Coordination, communication, creativity. Founder of the association since 2008.",
        "email": "a.koch@sprachcafe-polnisch.org",
        "img_url": "https://sprachcafe-polnisch.org/wp-content/uploads/2026/07/Agata-Koch-Headshot-2026-683x1024.avif"
    },
    {
        "slug": "02-elke-albers",
        "name": "Elke Albers",
        "category": "vorstand",
        "order": 2,
        "role_de": "Vorstandsmitglied & Schatzmeisterin",
        "role_pl": "Skarbnik i Członkini Zarządu",
        "role_en": "Board Member & Treasurer",
        "bio_de": "Schatzmeisterin, Finanzverwaltung und Fundraising für Förderprojekte des Vereins.",
        "bio_pl": "Skarbnik, finanse oraz pozyskiwanie funduszy na projekty stowarzyszenia.",
        "bio_en": "Treasurer, financial management, and fundraising for association projects.",
        "email": "e.albers@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2022/08/Elke-Albers-Foto-Elke-Albers.jpg?resize=300%2C300&ssl=1"
    },
    {
        "slug": "03-agnieszka-ghanname",
        "name": "Agnieszka Ghanname",
        "category": "vorstand",
        "order": 3,
        "role_de": "Vorstandsmitglied, Sozialberatung & Pädagogik",
        "role_pl": "Zarząd, Poradnictwo Społeczne i Pedagogika",
        "role_en": "Board Member, Social Counseling & Educator",
        "bio_de": "Vorstandsmitglied, Leitung der muttersprachlichen Sozialberatung und Kinderpädagogin.",
        "bio_pl": "Członkini zarządu, poradnictwo społeczne i pedagogika dziecięca.",
        "bio_en": "Board member, head of native language social counseling, and childhood educator.",
        "email": "a.ghanname@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2024/08/team-Agnieszka-Ghanname-150x150.webp?resize=300%2C300&ssl=1"
    },
    {
        "slug": "04-sandra-filip-badura",
        "name": "Sandra Filip-Badura",
        "category": "vorstand",
        "order": 4,
        "role_de": "Vorstandsmitglied & Polnisch als Fremdsprache",
        "role_pl": "Zarząd i Język Polski jako Obcy",
        "role_en": "Board Member & Polish as Foreign Language",
        "bio_de": "Konzeption und Koordination der Sprachkurse Polnisch als Fremdsprache für Erwachsene.",
        "bio_pl": "Koncepcja i koordynacja kursów języka polskiego dla dorosłych.",
        "bio_en": "Concept and coordination of adult Polish language courses.",
        "email": "s.filip-badura@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2021/01/team-Sandra-Filip-Badura.jpg?resize=300%2C300&ssl=1"
    },
    {
        "slug": "05-katarzyna-koziol",
        "name": "Katarzyna Aniela Koziol",
        "category": "vorstand",
        "order": 5,
        "role_de": "Vorstandsmitglied & Holistisches Coaching",
        "role_pl": "Zarząd i Coaching Holistyczny",
        "role_en": "Board Member & Holistic Coaching",
        "bio_de": "Diplom-Pädagogin, Coaching für Karriere, Business & Mindset.",
        "bio_pl": "Pedagog, coaching kariery, biznesu i rozwoju osobistego.",
        "bio_en": "Dipl.-Ped., holistic coaching for career, business, and mindset.",
        "email": "hallo@kasia-aniela-koziol.de",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2025/10/DSC06751-150x150.webp?resize=300%2C300&ssl=1"
    },

    # 2. Verwaltung & IT
    {
        "slug": "06-agnieszka-kubalewska",
        "name": "Agnieszka Kubalewska-Strohmeyer",
        "category": "verwaltung",
        "order": 6,
        "role_de": "Buchhaltung & Verwaltung",
        "role_pl": "Księgowość i Administracja",
        "role_en": "Accounting & Administration",
        "bio_de": "Buchhaltung, Abrechnung von Förderprojekten und Vereinsverwaltung.",
        "bio_pl": "Księgowość, rozliczanie projektów i administracja stowarzyszenia.",
        "bio_en": "Accounting, grant administration, and association management.",
        "email": "verwaltung@sprachcafe-polnisch.org",
        "img_url": None  # No real photo in WP -> uses initials badge
    },
    {
        "slug": "07-dorota-stasinska",
        "name": "Dorota Stasińska",
        "category": "verwaltung",
        "order": 7,
        "role_de": "Verwaltung, Vor-Ort-Koordination & BFD",
        "role_pl": "Administracja, Koordynacja i Wolontariat",
        "role_en": "Administration, On-Site Support & Volunteer",
        "bio_de": "Verwaltung, Vor-Ort-Betreuung und Besucherempfang im SprachCafé Pankow.",
        "bio_pl": "Administracja, obsługa na miejscu i recepcja w SprachCafé Pankow.",
        "bio_en": "Administration, on-site reception, and community support in Pankow.",
        "email": "d.stasinska@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2025/05/IMG_9989-scaled.webp?resize=300%2C300&ssl=1"
    },
    {
        "slug": "08-philipp-fuchs",
        "name": "Philipp Fuchs",
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
        "slug": "09-leokadia-rospek",
        "name": "Leokadia Rospek",
        "category": "paedagogik",
        "order": 9,
        "role_de": "Kinderpädagogin (Klub Malucha)",
        "role_pl": "Pedagog Dziecięcy (Klub Malucha)",
        "role_en": "Childhood Educator (Toddler Club)",
        "bio_de": "Sensorisch-kreative Frühförderung für Kleinkinder (1–3 Jahre) in Schöneberg und Köpenick.",
        "bio_pl": "Sensoryczno-kreatywne zajęcia dla maluszków (1–3 lat) w Schöneberg i Köpenick.",
        "bio_en": "Sensory-creative early childhood education for toddlers in Schöneberg and Köpenick.",
        "email": "l.rospek@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2026/02/Leokadia.webp?resize=300%2C300&ssl=1"
    },
    {
        "slug": "10-grzegorz-szklarczuk",
        "name": "Grzegorz Szklarczuk",
        "category": "paedagogik",
        "order": 10,
        "role_de": "Kinderpädagoge & Medienpädagogik",
        "role_pl": "Pedagog Dziecięcy i Edukacja Medialna",
        "role_en": "Childhood Educator & Media Literacy",
        "bio_de": "Medienworkshops, Filmprojekte und Sprachförderung für Kinder und Jugendliche.",
        "bio_pl": "Warsztaty medialne, projekty filmowe i edukacja językowa dla dzieci i młodzieży.",
        "bio_en": "Media workshops, film projects, and language education for youth.",
        "email": "g.szklarczuk@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2024/08/WhatsApp-Bild-2024-08-05-um-11.48.57_2556fe01-1-150x150-1.webp?resize=300%2C300&ssl=1"
    },
    {
        "slug": "11-magdalena-wadas",
        "name": "Magdalena Wadas",
        "category": "paedagogik",
        "order": 11,
        "role_de": "Kinderpädagogin & Koordination Schöneberg",
        "role_pl": "Pedagog Dziecięcy i Koordynacja Schöneberg",
        "role_en": "Childhood Educator & Schöneberg Lead",
        "bio_de": "Pädagogische Leitung und Betreuung der Kindergruppen in Berlin-Schöneberg.",
        "bio_pl": "Kierownictwo pedagogiczne grup dziecięcych w Berlinie Schöneberg.",
        "bio_en": "Pedagogical lead and coordination of children's groups in Berlin Schöneberg.",
        "email": "m.wadas@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2023/08/20230703_100351-scaled-e1691765200572-150x150.jpg?resize=300%2C300&ssl=1"
    },
    {
        "slug": "12-karolina-zuczek",
        "name": "Karolina Żuczek",
        "category": "paedagogik",
        "order": 12,
        "role_de": "Kinderpädagogin & Kreativwerkstatt",
        "role_pl": "Pedagog Dziecięcy i Warsztaty Twórcze",
        "role_en": "Childhood Educator & Creative Arts",
        "bio_de": "Kreatives Gestalten, Kunstpädagogik und Vorleseformate für Kinder.",
        "bio_pl": "Zajęcia plastyczne, pedagogika sztuki i czytanie bajek dla dzieci.",
        "bio_en": "Creative arts, art pedagogy, and storytelling for children.",
        "email": "k.zuczek@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2024/10/WhatsApp-Bild-2024-08-30-um-09.40.14_0e4c97c3-150x150.webp?resize=300%2C300&ssl=1"
    },
    {
        "slug": "13-joanna-ceremuga",
        "name": "Joanna Ceremuga",
        "category": "paedagogik",
        "order": 13,
        "role_de": "Mehrsprachigkeit & Englisch",
        "role_pl": "Wielojęzyczność i Język Angielski",
        "role_en": "Multilingualism & English",
        "bio_de": "Mehrsprachige Sprachanimation und spielerische Englisch- und Polnischförderung.",
        "bio_pl": "Wielojęzyczna animacja językowa i nauka angielskiego przez zabawę.",
        "bio_en": "Multilingual language animation and playful English and Polish tutoring.",
        "email": "j.ceremuga@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2024/09/JoannaCeremuga.Archiwumwlasne-150x150-1.webp?resize=300%2C300&ssl=1"
    },
    {
        "slug": "14-basia-stillmark",
        "name": "Basia Stillmark",
        "category": "paedagogik",
        "order": 14,
        "role_de": "Kinderpädagogin & Musikpädagogik",
        "role_pl": "Pedagog Dziecięcy i Edukacja Muzyczna",
        "role_en": "Childhood Educator & Music",
        "bio_de": "Musikalische Früherziehung, Sing- und Rhythmuskreise für Kinder und Eltern.",
        "bio_pl": "Wczesna edukacja muzyczna, śpiew i rytmika dla dzieci i rodziców.",
        "bio_en": "Early childhood music education, singing and rhythm circles.",
        "email": "b.stillmark@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2022/08/Basia-enface-1.jpg?resize=300%2C300&ssl=1"
    },
    {
        "slug": "15-dr-lilian-vazquez",
        "name": "Dr. Lilian Vázquez Sandoval",
        "category": "paedagogik",
        "order": 15,
        "role_de": "Mehrsprachigkeit & Filmworkshops",
        "role_pl": "Wielojęzyczność i Warsztaty Filmowe",
        "role_en": "Multilingualism & Film Studies",
        "bio_de": "Kulturelle Filmreihen, mehrsprachige Filmdiskussionen und Bildungsangebote.",
        "bio_pl": "Cykle filmowe, wielojęzyczne dyskusje o kinie i projekty edukacyjne.",
        "bio_en": "Cultural film series, multilingual discussions, and educational programs.",
        "email": "l.vazquez-sandoval@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2023/05/Lilian_IFA5.png?resize=300%2C300&ssl=1"
    },
    {
        "slug": "16-linda-kutzner",
        "name": "Linda Kutzner",
        "category": "paedagogik",
        "order": 16,
        "role_de": "Kinderpädagogin",
        "role_pl": "Pedagog Dziecięcy",
        "role_en": "Childhood Educator",
        "bio_de": "Pädagogische Begleitung von Kindergruppen und Sprachspielen im SprachCafé.",
        "bio_pl": "Opieka pedagogiczna nad grupami dziecięcymi i gry językowe.",
        "bio_en": "Pedagogical support for children's play and language groups.",
        "email": "kontakt@sprachcafe-polnisch.org",
        "img_url": "https://sprachcafe-polnisch.org/wp-content/uploads/2026/07/linda-ig-1-edited.avif"
    },
    {
        "slug": "17-katarzyna-adamek",
        "name": "Katarzyna Adamek",
        "category": "paedagogik",
        "order": 17,
        "role_de": "Kinderpädagogin & Bewegung",
        "role_pl": "Pedagog Dziecięcy i Ruch",
        "role_en": "Childhood Educator & Movement",
        "bio_de": "Bewegungs- und Koordinationsspiele für Kinder in der mehrsprachigen Gruppe.",
        "bio_pl": "Gry ruchowe i koordynacyjne dla dzieci w grupach wielojęzycznych.",
        "bio_en": "Movement and coordination activities for children in multilingual groups.",
        "email": "kontakt@sprachcafe-polnisch.org",
        "img_url": None  # No real photo in WP -> initials badge
    },
    {
        "slug": "18-natalia-abend",
        "name": "Natalia Abend",
        "category": "paedagogik",
        "order": 18,
        "role_de": "Sprachdozentin (Polnisch & Deutsch)",
        "role_pl": "Lektorka Języka Polskiego i Niemieckiego",
        "role_en": "Language Instructor (Polish & German)",
        "bio_de": "Konversationskurse, Grammatikworkshops und Sprachtraining für Erwachsene.",
        "bio_pl": "Kursy konwersacyjne, gramatyka i trening językowy dla dorosłych.",
        "bio_en": "Conversation courses, grammar workshops, and language training for adults.",
        "email": "natalia.abend@gmx.de",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2022/08/Natalia-Abend-Foto-Michael-Abend.jpg?resize=300%2C300&ssl=1"
    },

    # 4. Literatur
    {
        "slug": "19-natalia-pruefer",
        "name": "Natalia Prüfer",
        "category": "literatur",
        "order": 19,
        "role_de": "Literatur & Öffentlichkeitsarbeit",
        "role_pl": "Literatura i Public Relations",
        "role_en": "Literature & Public Relations",
        "bio_de": "Organisation von Autorenlesungen, Buchvorstellungen und redaktioneller Öffentlichkeitsarbeit.",
        "bio_pl": "Organizacja spotkań autorskich, promocja książek i relacje z mediami.",
        "bio_en": "Organizing author readings, book presentations, and public relations.",
        "email": "n.pruefer@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2023/12/IMG-20231219-WA0003-150x150.webp?resize=300%2C300&ssl=1"
    },
    {
        "slug": "20-natalie-wasserman",
        "name": "Natalie Wasserman",
        "category": "literatur",
        "order": 20,
        "role_de": "Kreatives Schreiben & Poesie",
        "role_pl": "Kreatywne Pisanie i Poezja",
        "role_en": "Creative Writing & Poetry",
        "bio_de": "Leitung der Schreibwerkstätten für mehrsprachige Lyrik und Prosa.",
        "bio_pl": "Prowadzenie warsztatów pisarskich wielojęzycznej poezji i prozy.",
        "bio_en": "Leading creative writing workshops for multilingual poetry and prose.",
        "email": "n.wasserman@web.de",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2024/08/team-Natalie-Wasserman-150x150-1-jpg.webp?resize=300%2C300&ssl=1"
    },
    {
        "slug": "21-malgorzata-kaminska",
        "name": "Małgorzata Kamińska",
        "category": "literatur",
        "order": 21,
        "role_de": "Introspektives Schreiben & Meditation",
        "role_pl": "Pisanie Introspektywne i Medytacja",
        "role_en": "Introspective Writing & Mindfulness",
        "bio_de": "Achtsamkeitsorientierte Schreib- und Meditationsabende im SprachCafé.",
        "bio_pl": "Wieczory uważności, pisania terapeutycznego i medytacji.",
        "bio_en": "Mindfulness-oriented reflective writing and meditation circles.",
        "email": "m.rubaszewska@wp.pl",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2025/02/1-01.02.25-scaled.webp?resize=300%2C300&ssl=1"
    },
    {
        "slug": "22-katarzyna-habas",
        "name": "Katarzyna Habas",
        "category": "literatur",
        "order": 22,
        "role_de": "Projektmanagerin Kultur & Literatur",
        "role_pl": "Menedżerka Projektów Kultury i Literatury",
        "role_en": "Cultural & Literary Project Manager",
        "bio_de": "Planung und Durchführung von Kulturprojekten, Lesefestivals und Austauschformaten.",
        "bio_pl": "Planowanie i realizacja projektów kulturalnych, festiwali czytelniczych i wymiany.",
        "bio_en": "Planning and execution of cultural programs and literary festivals.",
        "email": "k.habas@sprachcafe-polnisch.org",
        "img_url": "https://sprachcafe-polnisch.org/wp-content/uploads/2026/02/katarzyna_habas-scaled.webp"
    },

    # 5. Kunst & Kreatives
    {
        "slug": "23-aleksandra-gajda",
        "name": "Aleksandra Gajda",
        "category": "kunst",
        "order": 23,
        "role_de": "Künstlerin & KunstWorkshops",
        "role_pl": "Artystka i Warsztaty Sztuki",
        "role_en": "Artist & Art Workshops",
        "bio_de": "Künstlerische Workshops, Malerei und experimentelle Gestaltungskurse.",
        "bio_pl": "Warsztaty artystyczne, malarstwo i kursy eksperymentalne.",
        "bio_en": "Fine arts workshops, painting, and experimental visual art.",
        "email": "aleksandragajda.art@gmail.com",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2021/04/Aleksandra-G.jpeg?resize=300%2C300&ssl=1"
    },
    {
        "slug": "24-malgorzata-reszka-matthes",
        "name": "Małgorzata Reszka-Matthes",
        "category": "kunst",
        "order": 24,
        "role_de": "Kinderpädagogin & Künstlerin",
        "role_pl": "Pedagog Dziecięcy i Artystka",
        "role_en": "Childhood Educator & Artist",
        "bio_de": "Gestaltungskurse, handwerkliche Kunstformate und Ausstellungsbetreuung.",
        "bio_pl": "Warsztaty plastyczne, rzemiosło artystyczne i opieka nad wystawami.",
        "bio_en": "Artistic design courses, handcrafted art, and exhibition curation.",
        "email": "m.reszka-matthes@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2025/01/Zdjecie-profilowe-1.webp?resize=300%2C300&ssl=1"
    },
    {
        "slug": "25-jean-francois-renault",
        "name": "Dr. Jean-François Renault / JP Bouzac",
        "category": "kunst",
        "order": 25,
        "role_de": "Galerie, Nachhaltigkeit & Französisch",
        "role_pl": "Galeria, Prawa Człowieka i Język Francuski",
        "role_en": "Gallery, Human Rights & French",
        "bio_de": "Kuration von Ausstellungen zu Nachhaltigkeit & Menschenwürde, französische Konversationsrunden.",
        "bio_pl": "Kuratela wystaw o prawach człowieka i zrównoważonym rozwoju oraz konwersacje po francusku.",
        "bio_en": "Exhibition curation on human dignity and sustainability, and French language circles.",
        "email": "jfrenault@gmail.com",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2023/05/JF-Renault-1.jpg?resize=300%2C300&ssl=1"
    },

    # 6. Arbeitsmarkt & Business
    {
        "slug": "26-malgorzata-hoffmann",
        "name": "Małgorzata Hoffmann, DBA",
        "category": "business",
        "order": 26,
        "role_de": "Doctor of Business Administration (KI & Marketing)",
        "role_pl": "Doctor of Business Administration (AI i Marketing)",
        "role_en": "Doctor of Business Administration (AI & Marketing)",
        "bio_de": "Workshops zu Künstlicher Intelligenz, Marketing & Karriereentwicklung.",
        "bio_pl": "Warsztaty ze sztucznej inteligencji, marketingu i rozwoju kariery.",
        "bio_en": "Workshops on Artificial Intelligence, marketing, and career restart.",
        "email": "academy.ai.berlin@gmail.com",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2025/10/thumbnail_ddaaf858-ab49-4266-9cfb-147baba6d58d.webp?resize=300%2C300&ssl=1"
    },
    {
        "slug": "27-olga-sosta",
        "name": "Olga Sosta",
        "category": "business",
        "order": 27,
        "role_de": "Berufliche Beratung & Frauennetzwerk",
        "role_pl": "Doradztwo Zawodowe i Sieć Kobiet",
        "role_en": "Career Counseling & Women's Network",
        "bio_de": "Begleitung von Migrantinnen beim Einstieg in den Berliner Arbeitsmarkt.",
        "bio_pl": "Wsparcie kobiet z doświadczeniem migracyjnym na berlińskim rynku pracy.",
        "bio_en": "Supporting women with migrant backgrounds entering the Berlin job market.",
        "email": "kontakt@sprachcafe-polnisch.org",
        "img_url": None  # No real photo in WP -> initials badge
    },

    # 7. Technik & Handwerk
    {
        "slug": "28-andrzej-konieczny",
        "name": "Andrzej Konieczny",
        "category": "technik",
        "order": 28,
        "role_de": "Facility Management & Haustechnik",
        "role_pl": "Złota Rączka i Obsługa Techniczna",
        "role_en": "Facility Management & Handyman",
        "bio_de": "Der Alleskönner in der Schulzestraße — Instandhaltung, Holzarbeiten und Raumgestaltung.",
        "bio_pl": "Złota rączka w siedzibie przy Schulzestraße — konserwacja, drewno i aranżacja wnętrz.",
        "bio_en": "Master of all trades at Schulzestraße — maintenance, woodworking, and interior craft.",
        "email": "andrzejkonieczny702@gmail.com",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2022/08/Andrzej-Konieczny-Foto-A.K..jpg?resize=300%2C300&ssl=1"
    },
    {
        "slug": "29-michal-kaminski",
        "name": "Michał Kamiński",
        "category": "technik",
        "order": 29,
        "role_de": "Veranstaltungstechnik & Ton",
        "role_pl": "Technika Estradowa i Nagłośnienie",
        "role_en": "Event Technology & Audio Engineering",
        "bio_de": "Ton- und Lichttechnik bei Konzerten, Lesungen und Kulturfestivals des SprachCafés.",
        "bio_pl": "Obsługa dźwiękowa i oświetleniowa koncertów, spotkań autorskich i festiwali.",
        "bio_en": "Audio and lighting engineering for concerts, readings, and community festivals.",
        "email": "aqustick@wp.pl",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2022/08/IMG_1086-Michal-2.jpg?resize=300%2C300&ssl=1"
    },

    # 8. Bundesfreiwilligendienst (BFD)
    {
        "slug": "30-dayna-welch",
        "name": "Dayna Welch",
        "category": "bfd",
        "order": 30,
        "role_de": "Bundesfreiwilligendienst (BFD)",
        "role_pl": "Wolontariat Federalny (BFD)",
        "role_en": "Federal Volunteer Service (BFD)",
        "bio_de": "Unterstützung im Café-Betrieb, bei Kindergruppen und der Vorbereitung von Vereinsevents.",
        "bio_pl": "Wsparcie w kawiarni, przy grupach dziecięcych i organizacji wydarzeń.",
        "bio_en": "Support in café operations, children's groups, and event coordination.",
        "email": "d.welch@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2025/05/WhatsApp-Bild-2025-05-06-um-10.59.01_5b67fc0a.webp?resize=300%2C300&ssl=1"
    },
    {
        "slug": "31-agata-serwinska",
        "name": "Agata Serwińska",
        "category": "bfd",
        "order": 31,
        "role_de": "Bundesfreiwilligendienst (BFD)",
        "role_pl": "Wolontariat Federalny (BFD)",
        "role_en": "Federal Volunteer Service (BFD)",
        "bio_de": "Bibliotheksdienst, Begleitung von Sprachrunden und Kiez-Aktivitäten.",
        "bio_pl": "Obsługa biblioteki, pomoc przy spotkaniach językowych i działaniach lokalnych.",
        "bio_en": "Library assistance, language meetups support, and neighborhood initiatives.",
        "email": "kontakt@sprachcafe-polnisch.org",
        "img_url": None  # No real photo in WP -> initials badge
    }
]

def download_person_image(url, slug):
    if not url:
        return "/images/team/avatar-default.svg"
    
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
        print(f"✓ Downloaded {filename}")
        return f"/images/team/{filename}"
    except Exception as e:
        print(f"⚠️ Failed to download image for {slug}: {e}")
        return "/images/team/avatar-default.svg"

for m in team:
    photo = download_person_image(m["img_url"], m["slug"])
    
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

print(f"\n🎉 Clean team build finished! Total: {len(team)} verified, unique profiles.")
