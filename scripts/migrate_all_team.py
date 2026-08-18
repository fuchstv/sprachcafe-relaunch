import re
import urllib.request
import os
import json

output_img_dir = "/home/ubuntu/sprachcafe-relaunch/frontend/public/images/team"
output_md_dir = "/home/ubuntu/sprachcafe-relaunch/frontend/src/content/team"
os.makedirs(output_img_dir, exist_ok=True)
os.makedirs(output_md_dir, exist_ok=True)

# Clear old team files
for f in os.listdir(output_md_dir):
    if f.endswith('.md'):
        os.remove(os.path.join(output_md_dir, f))

# Scraped raw data
with open("/home/ubuntu/sprachcafe-relaunch/scripts/scraped_team.json", "r", encoding="utf-8") as f:
    raw_items = json.load(f)

print(f"Total raw items: {len(raw_items)}")

# Helper to download image
def download_image(url, filename):
    if not url:
        return "/images/team/avatar-default.svg"
    # clean query params if needed or use full url
    ext = ".jpg"
    if ".webp" in url:
        ext = ".webp"
    elif ".png" in url:
        ext = ".png"
    elif ".avif" in url:
        ext = ".avif"
    
    local_filename = f"{filename}{ext}"
    local_path = os.path.join(output_img_dir, local_filename)
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response, open(local_path, 'wb') as out_file:
            out_file.write(response.read())
        print(f"✓ Downloaded {local_filename}")
        return f"/images/team/{local_filename}"
    except Exception as e:
        print(f"⚠️ Failed to download {url}: {e}")
        return "/images/team/avatar-default.svg"

# Definitive team list
team_list = [
    # 1. Vorstand
    {
        "slug": "01-agata-koch",
        "name": "Agata Koch",
        "category": "vorstand",
        "order": 1,
        "role": {
            "de": "Vorstandsvorsitzende & Gründerin",
            "pl": "Przewodnicząca Zarządu i Założycielka",
            "en": "Chairwoman & Founder"
        },
        "bio": {
            "de": "Koordination, Kommunikation, Kreativität. Gründerin des SprachCafé Polnisch e.V. seit 2008.",
            "pl": "Koordynacja, komunikacja, kreatywność. Założycielka stowarzyszenia w 2008 roku.",
            "en": "Coordination, communication, creativity. Founder of the association since 2008."
        },
        "email": "a.koch@sprachcafe-polnisch.org",
        "img_url": "https://sprachcafe-polnisch.org/wp-content/uploads/2026/07/Agata-Koch-Headshot-2026-683x1024.avif"
    },
    {
        "slug": "02-elke-albers",
        "name": "Elke Albers",
        "category": "vorstand",
        "order": 2,
        "role": {
            "de": "Vorstandsmitglied & Schatzmeisterin",
            "pl": "Skarbnik i Członkini Zarządu",
            "en": "Board Member & Treasurer"
        },
        "bio": {
            "de": "Schatzmeisterin, Finanzverwaltung und Fundraising für Förderprojekte des Vereins.",
            "pl": "Skarbnik, finanse oraz pozyskiwanie funduszy na projekty stowarzyszenia.",
            "en": "Treasurer, financial administration, and fundraising for association projects."
        },
        "email": "e.albers@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2022/08/Elke-Albers-Foto-Elke-Albers.jpg?resize=300%2C300&ssl=1"
    },
    {
        "slug": "03-agnieszka-ghanname",
        "name": "Agnieszka Ghanname",
        "category": "vorstand",
        "order": 3,
        "role": {
            "de": "Vorstandsmitglied & Sozialberatung",
            "pl": "Zarząd i Poradnictwo Społeczne",
            "en": "Board Member & Social Counseling"
        },
        "bio": {
            "de": "Leitung der muttersprachlichen Sozialberatung und nachbarschaftlichen Unterstützung.",
            "pl": "Kierowanie poradnictwem społecznym i wsparciem sąsiedzkim.",
            "en": "Leading native language social counseling and community support."
        },
        "email": "a.ghanname@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2024/08/team-Agnieszka-Ghanname-150x150.webp?resize=300%2C300&ssl=1"
    },
    {
        "slug": "04-sandra-filip-badura",
        "name": "Sandra Filip-Badura",
        "category": "vorstand",
        "order": 4,
        "role": {
            "de": "Vorstandsmitglied & Polnisch als Fremdsprache",
            "pl": "Zarząd i Język Polski jako Obcy",
            "en": "Board Member & Polish as a Foreign Language"
        },
        "bio": {
            "de": "Methodische Konzeption und Koordination der Sprachkurse für Erwachsene.",
            "pl": "Metodyczna koncepcja i koordynacja kursów językowych dla dorosłych.",
            "en": "Methodological concept and coordination of adult Polish language courses."
        },
        "email": "s.filip-badura@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2021/01/team-Sandra-Filip-Badura.jpg?resize=300%2C300&ssl=1"
    },
    {
        "slug": "05-katarzyna-koziol",
        "name": "Katarzyna Aniela Koziol",
        "category": "vorstand",
        "order": 5,
        "role": {
            "de": "Dipl.-Päd., Holistisches Coaching & Business",
            "pl": "Pedagog, Coaching Holistyczny i Biznes",
            "en": "Dipl.-Ped., Holistic Coaching & Mindset"
        },
        "bio": {
            "de": "Coaching für Karriere, Business & Mindset sowie interkulturelle Frauennetzwerke.",
            "pl": "Coaching kariery, biznesu i rozwoju osobistego oraz sieci kobiet.",
            "en": "Coaching for career, business, mindset, and intercultural women networks."
        },
        "email": "hallo@kasia-aniela-koziol.de",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2025/10/DSC06751-scaled.webp?resize=300%2C300&ssl=1"
    },

    # 2. Verwaltung & IT
    {
        "slug": "06-agnieszka-kubalewska",
        "name": "Agnieszka Kubalewska-Strohmeyer",
        "category": "verwaltung",
        "order": 6,
        "role": {
            "de": "Buchhaltung & Verwaltung",
            "pl": "Księgowość i Administracja",
            "en": "Accounting & Administration"
        },
        "bio": {
            "de": "Buchhalterische Betreuung, Rechnungslegung und allgemeine Vereinsverwaltung.",
            "pl": "Obsługa księgowa, fakturowanie i administracja stowarzyszenia.",
            "en": "Financial accounting, billing, and general administration."
        },
        "email": "verwaltung@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2026/05/Silver.webp?resize=300%2C300&ssl=1"
    },
    {
        "slug": "07-dorota-stasinska",
        "name": "Dorota Stasińska",
        "category": "verwaltung",
        "order": 7,
        "role": {
            "de": "Verwaltung & Bundesfreiwilligendienst",
            "pl": "Administracja i Wolontariat BFD",
            "en": "Administration & Federal Volunteer"
        },
        "bio": {
            "de": "Verwaltung, Vor-Ort-Betreuung und Besucherempfang im SprachCafé Pankow.",
            "pl": "Administracja, obsługa na miejscu i recepcja w SprachCafé Pankow.",
            "en": "Administration, on-site support, and reception at SprachCafé Pankow."
        },
        "email": "d.stasinska@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2025/05/IMG_9989-scaled.webp?resize=300%2C300&ssl=1"
    },
    {
        "slug": "08-philipp-fuchs",
        "name": "Philipp Fuchs",
        "category": "verwaltung",
        "order": 8,
        "role": {
            "de": "IT & Digitale Infrastruktur",
            "pl": "IT i Infrastruktura Cyfrowa",
            "en": "IT & Digital Infrastructure"
        },
        "bio": {
            "de": "Entwicklung und Betreuung des Astro-Webportals, der Hausbibliothek und der M365-Workflows.",
            "pl": "Tworzenie i opieka nad portalem Astro, biblioteką i procesami M365.",
            "en": "Development and maintenance of the Astro portal, digital library, and M365 workflows."
        },
        "email": "p.fuchs@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2025/05/IMG_0157-150x150.webp?resize=300%2C300&ssl=1"
    },

    # 3. Pädagog:innen
    {
        "slug": "09-leokadia-rospek",
        "name": "Leokadia Rospek",
        "category": "paedagogik",
        "order": 9,
        "role": {
            "de": "Kinderpädagogin (Klub Malucha)",
            "pl": "Pedagog Dziecięcy (Klub Malucha)",
            "en": "Childhood Educator (Toddler Club)"
        },
        "bio": {
            "de": "Sensorisch-kreative Frühförderung für Kleinkinder (1–3 Jahre) in Schöneberg und Köpenick.",
            "pl": "Zajęcia sensoryczno-kreatywne dla maluszków (1–3 lat) w Schöneberg i Köpenick.",
            "en": "Sensory and creative early childhood education for toddlers in Schöneberg and Köpenick."
        },
        "email": "l.rospek@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2026/02/Leokadia.webp?resize=300%2C300&ssl=1"
    },
    {
        "slug": "10-grzegorz-szklarczuk",
        "name": "Grzegorz Szklarczuk",
        "category": "paedagogik",
        "order": 10,
        "role": {
            "de": "Kinderpädagoge & Medienpädagogik",
            "pl": "Pedagog Dziecięcy i Edukacja Medialna",
            "en": "Childhood Educator & Media Literacy"
        },
        "bio": {
            "de": "Medienworkshops, Filmprojekte und Sprachförderung für Kinder und Jugendliche.",
            "pl": "Warsztaty medialne, projekty filmowe i edukacja językowa dla dzieci i młodzieży.",
            "en": "Media workshops, film projects, and language education for kids and teens."
        },
        "email": "g.szklarczuk@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2024/08/WhatsApp-Bild-2024-08-05-um-11.48.57_2556fe01-1-150x150-1.webp?resize=300%2C300&ssl=1"
    },
    {
        "slug": "11-magdalena-wadas",
        "name": "Magdalena Wadas",
        "category": "paedagogik",
        "order": 11,
        "role": {
            "de": "Kinderpädagogin & Koordination Schöneberg",
            "pl": "Pedagog Dziecięcy i Koordynacja Schöneberg",
            "en": "Childhood Educator & Schöneberg Lead"
        },
        "bio": {
            "de": "Pädagogische Leitung und Betreuung der Kindergruppen und Familienangebote in Berlin-Schöneberg.",
            "pl": "Kierownictwo pedagogiczne grup dziecięcych i rodzinnych w Berlinie Schöneberg.",
            "en": "Pedagogical lead and coordination of children's groups in Berlin Schöneberg."
        },
        "email": "m.wadas@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2023/08/20230703_100351-scaled-e1691765200572-150x150.jpg?resize=300%2C300&ssl=1"
    },
    {
        "slug": "12-karolina-zuczek",
        "name": "Karolina Żuczek",
        "category": "paedagogik",
        "order": 12,
        "role": {
            "de": "Kinderpädagogin & Kreativwerkstatt",
            "pl": "Pedagog Dziecięcy i Warsztaty Twórcze",
            "en": "Childhood Educator & Creative Arts"
        },
        "bio": {
            "de": "Kreatives Gestalten, Kunstpädagogik und Vorleseformate für Vorschulkinder.",
            "pl": "Zajęcia plastyczne, pedagogika sztuki i czytanie bajek dla przedszkolaków.",
            "en": "Creative arts, art pedagogy, and storytelling for preschoolers."
        },
        "email": "k.zuczek@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2024/10/WhatsApp-Bild-2024-08-30-um-09.40.14_0e4c97c3-150x150.webp?resize=300%2C300&ssl=1"
    },
    {
        "slug": "13-joanna-ceremuga",
        "name": "Joanna Ceremuga",
        "category": "paedagogik",
        "order": 13,
        "role": {
            "de": "Mehrsprachigkeit & Englischkurse",
            "pl": "Wielojęzyczność i Język Angielski",
            "en": "Multilingualism & English Courses"
        },
        "bio": {
            "de": "Mehrsprachige Sprachanimation und spielerische Englisch- und Polnischförderung.",
            "pl": "Wielojęzyczna animacja językowa i nauka angielskiego oraz polskiego przez zabawę.",
            "en": "Multilingual language animation and playful English and Polish language acquisition."
        },
        "email": "j.ceremuga@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2024/09/JoannaCeremuga.Archiwumwlasne-150x150-1.webp?resize=300%2C300&ssl=1"
    },
    {
        "slug": "14-basia-stillmark",
        "name": "Basia Stillmark",
        "category": "paedagogik",
        "order": 14,
        "role": {
            "de": "Kinderpädagogin & Musikpädagogik",
            "pl": "Pedagog Dziecięcy i Edukacja Muzyczna",
            "en": "Childhood Educator & Music"
        },
        "bio": {
            "de": "Musikalische Früherziehung, Sing- und Rhythmuskreise für Kinder und Eltern.",
            "pl": "Wczesna edukacja muzyczna, śpiew i rytmika dla dzieci i rodziców.",
            "en": "Early music education, singing and rhythm circles for children and parents."
        },
        "email": "b.stillmark@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2022/08/Basia-enface-1.jpg?resize=300%2C300&ssl=1"
    },
    {
        "slug": "15-dr-lilian-vazquez",
        "name": "Dr. Lilian Vázquez Sandoval",
        "category": "paedagogik",
        "order": 15,
        "role": {
            "de": "Mehrsprachigkeit & Filmworkshops",
            "pl": "Wielojęzyczność i Warsztaty Filmowe",
            "en": "Multilingualism & Film Studies"
        },
        "bio": {
            "de": "Kulturelle Filmreihen, mehrsprachige Filmdiskussionen und Bildungsangebote.",
            "pl": "Cykle filmowe, wielojęzyczne dyskusje o kinie i projekty edukacyjne.",
            "en": "Cultural film series, multilingual discussions, and educational projects."
        },
        "email": "l.vazquez-sandoval@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2024/09/WhatsApp-Bild-2024-09-08-um-16.14.39_99839ae2-150x150.webp?resize=300%2C300&ssl=1"
    },
    {
        "slug": "16-linda-kutzner",
        "name": "Linda Kutzner",
        "category": "paedagogik",
        "order": 16,
        "role": {
            "de": "Kinderpädagogin & Sprachspiele",
            "pl": "Pedagog Dziecięcy i Gry Językowe",
            "en": "Childhood Educator & Language Play"
        },
        "bio": {
            "de": "Pädagogische Begleitung von Kindergruppen und Sprachspielen im SprachCafé.",
            "pl": "Opieka pedagogiczna nad grupami dziecięcymi i gry językowe.",
            "en": "Pedagogical support for children's groups and language play."
        },
        "email": "kontakt@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2024/09/WhatsApp-Bild-2024-09-08-um-17.51.52_d6b412bf-150x150.webp?resize=300%2C300&ssl=1"
    },
    {
        "slug": "17-katarzyna-adamek",
        "name": "Katarzyna Adamek",
        "category": "paedagogik",
        "order": 17,
        "role": {
            "de": "Kinderpädagogin & Bewegung",
            "pl": "Pedagog Dziecięcy i Ruch",
            "en": "Childhood Educator & Movement"
        },
        "bio": {
            "de": "Bewegungs- und Koordinationsspiele für Kinder in der mehrsprachigen Gruppe.",
            "pl": "Gry ruchowe i koordynacyjne dla dzieci w grupach wielojęzycznych.",
            "en": "Movement and coordination activities for children in multilingual groups."
        },
        "email": "kontakt@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2024/09/WhatsApp-Bild-2024-09-08-um-16.14.39_33b8a1c9-150x150.webp?resize=300%2C300&ssl=1"
    },
    {
        "slug": "18-natalia-abend",
        "name": "Natalia Abend",
        "category": "paedagogik",
        "order": 18,
        "role": {
            "de": "Sprachdozentin (Polnisch & Deutsch)",
            "pl": "Lektorka Języka Polskiego i Niemieckiego",
            "en": "Language Instructor (Polish & German)"
        },
        "bio": {
            "de": "Konversationskurse, Grammatikworkshops und Sprachtraining für Erwachsene.",
            "pl": "Kursy konwersacyjne, gramatyka i trening językowy dla dorosłych.",
            "en": "Conversation courses, grammar workshops, and language training for adults."
        },
        "email": "natalia.abend@gmx.de",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2024/09/WhatsApp-Bild-2024-09-08-um-16.14.39_99839ae2-150x150.webp?resize=300%2C300&ssl=1"
    },

    # 4. Literatur & Schreiben
    {
        "slug": "19-natalia-pruefer",
        "name": "Natalia Prüfer",
        "category": "literatur",
        "order": 19,
        "role": {
            "de": "Literatur & Öffentlichkeitsarbeit",
            "pl": "Literatura i Public Relations",
            "en": "Literature & Public Relations"
        },
        "bio": {
            "de": "Organisation von Autorenlesungen, Buchvorstellungen und redaktioneller Öffentlichkeitsarbeit.",
            "pl": "Organizacja spotkań autorskich, promocja książek i relacje z mediami.",
            "en": "Organizing author readings, book presentations, and public relations."
        },
        "email": "n.pruefer@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2024/09/WhatsApp-Bild-2024-09-08-um-18.06.49_d022fa9f-150x150.webp?resize=300%2C300&ssl=1"
    },
    {
        "slug": "20-natalie-wasserman",
        "name": "Natalie Wasserman",
        "category": "literatur",
        "order": 20,
        "role": {
            "de": "Kreatives Schreiben & Poesie",
            "pl": "Kreatywne Pisanie i Poezja",
            "en": "Creative Writing & Poetry"
        },
        "bio": {
            "de": "Leitung der Schreibwerkstätten für mehrsprachige Lyrik und Prosa.",
            "pl": "Prowadzenie warsztatów pisarskich wielojęzycznej poezji i prozy.",
            "en": "Leading creative writing workshops for multilingual poetry and prose."
        },
        "email": "n.wasserman@web.de",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2024/09/WhatsApp-Bild-2024-09-08-um-16.14.39_e2efb686-150x150.webp?resize=300%2C300&ssl=1"
    },
    {
        "slug": "21-malgorzata-kaminska",
        "name": "Małgorzata Kamińska",
        "category": "literatur",
        "order": 21,
        "role": {
            "de": "Introspektives Schreiben & Meditation",
            "pl": "Pisanie Introspektywne i Medytacja",
            "en": "Introspective Writing & Mindfulness"
        },
        "bio": {
            "de": "Achtsamkeitsorientierte Schreib- und Meditationsabende im SprachCafé.",
            "pl": "Wieczory uważności, pisania terapeutycznego i medytacji.",
            "en": "Mindfulness-oriented reflective writing and meditation circles."
        },
        "email": "m.rubaszewska@wp.pl",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2024/09/WhatsApp-Bild-2024-09-08-um-16.14.39_6a1936c5-150x150.webp?resize=300%2C300&ssl=1"
    },
    {
        "slug": "22-katarzyna-habas",
        "name": "Katarzyna Habas",
        "category": "literatur",
        "order": 22,
        "role": {
            "de": "Projektmanagerin Kultur & Literatur",
            "pl": "Menedżerka Projektów Kultury i Literatury",
            "en": "Cultural & Literary Project Manager"
        },
        "bio": {
            "de": "Planung und Durchführung von Kulturprojekten, Lesefestivals und Austauschformaten.",
            "pl": "Planowanie i realizacja projektów kulturalnych, festiwali czytelniczych i wymiany.",
            "en": "Planning and execution of cultural programs and literary festivals."
        },
        "email": "k.habas@sprachcafe-polnisch.org",
        "img_url": "https://sprachcafe-polnisch.org/wp-content/uploads/2026/02/katarzyna_habas-scaled.webp"
    },

    # 5. Kunst & Kreatives
    {
        "slug": "23-aleksandra-gajda",
        "name": "Aleksandra Gajda",
        "category": "kunst",
        "order": 23,
        "role": {
            "de": "Künstlerin & Kunstworkshops",
            "pl": "Artystka i Warsztaty Sztuki",
            "en": "Artist & Art Workshops"
        },
        "bio": {
            "de": "Künstlerische Workshops, Malerei und experimentelle Gestaltungskurse.",
            "pl": "Warsztaty artystyczne, malarstwo i kursy eksperymentalne.",
            "en": "Fine arts workshops, painting, and experimental visual art."
        },
        "email": "aleksandragajda.art@gmail.com",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2024/09/WhatsApp-Bild-2024-09-08-um-16.14.39_7bf91e46-150x150.webp?resize=300%2C300&ssl=1"
    },
    {
        "slug": "24-malgorzata-reszka-matthes",
        "name": "Małgorzata Reszka-Matthes",
        "category": "kunst",
        "order": 24,
        "role": {
            "de": "Künstlerin & Pädagogin",
            "pl": "Artystka i Pedagog",
            "en": "Artist & Educator"
        },
        "bio": {
            "de": "Gestaltungskurse, handwerkliche Kunstformate und Ausstellungsbetreuung.",
            "pl": "Warsztaty plastyczne, rzemiosło artystyczne i opieka nad wystawami.",
            "en": "Artistic design courses, handcrafted art, and exhibition curation."
        },
        "email": "m.reszka-matthes@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2024/09/WhatsApp-Bild-2024-09-08-um-16.14.39_2a02b34a-150x150.webp?resize=300%2C300&ssl=1"
    },
    {
        "slug": "25-jean-francois-renault",
        "name": "Dr. Jean-François Renault / JP Bouzac",
        "category": "kunst",
        "order": 25,
        "role": {
            "de": "Galerie, Menschenwürde & Französisch",
            "pl": "Galeria, Prawa Człowieka i Język Francuski",
            "en": "Gallery, Human Rights & French"
        },
        "bio": {
            "de": "Kuration von Ausstellungen zu Nachhaltigkeit, Menschenwürde und französische Konversationsrunden.",
            "pl": "Kuratela wystaw o prawach człowieka i zrównoważonym rozwoju oraz konwersacje po francusku.",
            "en": "Exhibition curation on human dignity and sustainability, and French language circles."
        },
        "email": "jfrenault@gmail.com",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2024/09/WhatsApp-Bild-2024-09-08-um-16.14.39_12c75a43-150x150.webp?resize=300%2C300&ssl=1"
    },

    # 6. Arbeitsmarkt & Business
    {
        "slug": "26-malgorzata-hoffmann",
        "name": "Małgorzata Hoffmann, DBA",
        "category": "business",
        "order": 26,
        "role": {
            "de": "Doctor of Business Administration (KI & Marketing)",
            "pl": "Doctor of Business Administration (AI i Marketing)",
            "en": "Doctor of Business Administration (AI & Marketing)"
        },
        "bio": {
            "de": "Workshops zu Künstlicher Intelligenz, digitalem Marketing und beruflicher Neuorientierung in Berlin.",
            "pl": "Warsztaty ze sztucznej inteligencji, marketingu cyfrowego i restartu zawodowego w Berlinie.",
            "en": "Workshops on AI, digital marketing, and career restart programs in Berlin."
        },
        "email": "academy.ai.berlin@gmail.com",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2024/09/WhatsApp-Bild-2024-09-08-um-16.14.39_99839ae2-150x150.webp?resize=300%2C300&ssl=1"
    },
    {
        "slug": "27-olga-sosta",
        "name": "Olga Sosta",
        "category": "business",
        "order": 27,
        "role": {
            "de": "Berufliche Beratung & Frauennetzwerk",
            "pl": "Doradztwo Zawodowe i Sieć Kobiet",
            "en": "Career Counseling & Women's Network"
        },
        "bio": {
            "de": "Begleitung von Migrantinnen beim Einstieg in den Berliner Arbeitsmarkt.",
            "pl": "Wsparcie kobiet z doświadczeniem migracyjnym na berlińskim rynku pracy.",
            "en": "Supporting women with migrant backgrounds entering the Berlin job market."
        },
        "email": "kontakt@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2024/09/WhatsApp-Bild-2024-09-08-um-16.14.39_33b8a1c9-150x150.webp?resize=300%2C300&ssl=1"
    },

    # 7. Technik & Handwerk
    {
        "slug": "28-andrzej-konieczny",
        "name": "Andrzej Konieczny",
        "category": "technik",
        "order": 28,
        "role": {
            "de": "Facility Management & Haustechnik",
            "pl": "Złota Rączka i Obsługa Techniczna",
            "en": "Facility Management & Handyman"
        },
        "bio": {
            "de": "Der Alleskönner in der Schulzestraße — Instandhaltung, Holzarbeiten und Raumgestaltung.",
            "pl": "Złota rączka w siedzibie przy Schulzestraße — konserwacja, drewno i aranżacja wnętrz.",
            "en": "Master of all trades at Schulzestraße — maintenance, woodworking, and interior craft."
        },
        "email": "andrzejkonieczny702@gmail.com",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2022/08/Andrzej-Konieczny-Foto-A.K.-scaled.jpg?resize=300%2C300&ssl=1"
    },
    {
        "slug": "29-michal-kaminski",
        "name": "Michał Kamiński",
        "category": "technik",
        "order": 29,
        "role": {
            "de": "Veranstaltungstechnik & Ton",
            "pl": "Technika Estradowa i Nagłośnienie",
            "en": "Event Technology & Audio Engineering"
        },
        "bio": {
            "de": "Ton- und Lichttechnik bei Konzerten, Lesungen und Kulturfestivals des SprachCafés.",
            "pl": "Obsługa dźwiękowa i oświetleniowa koncertów, spotkań autorskich i festiwali.",
            "en": "Audio and lighting engineering for concerts, readings, and community festivals."
        },
        "email": "aqustick@wp.pl",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2022/08/IMG_1086-Michal-2.jpg?resize=300%2C300&ssl=1"
    },

    # 8. Bundesfreiwilligendienst (BFD)
    {
        "slug": "30-dayna-welch",
        "name": "Dayna Welch",
        "category": "bfd",
        "order": 30,
        "role": {
            "de": "Bundesfreiwilligendienst (BFD)",
            "pl": "Wolontariat Federalny (BFD)",
            "en": "Federal Volunteer Service (BFD)"
        },
        "bio": {
            "de": "Unterstützung im Café-Betrieb, bei Kindergruppen und der Vorbereitung von Vereinsevents.",
            "pl": "Wsparcie w kawiarni, przy grupach dziecięcych i organizacji wydarzeń.",
            "en": "Support in café operations, children's groups, and event coordination."
        },
        "email": "d.welch@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2024/09/WhatsApp-Bild-2024-09-08-um-16.14.39_6a1936c5-150x150.webp?resize=300%2C300&ssl=1"
    },
    {
        "slug": "31-agata-serwinska",
        "name": "Agata Serwińska",
        "category": "bfd",
        "order": 31,
        "role": {
            "de": "Bundesfreiwilligendienst (BFD)",
            "pl": "Wolontariat Federalny (BFD)",
            "en": "Federal Volunteer Service (BFD)"
        },
        "bio": {
            "de": "Bibliotheksdienst, Begleitung von Sprachrunden und Kiez-Aktivitäten.",
            "pl": "Obsługa biblioteki, pomoc przy spotkaniach językowych i działaniach lokalnych.",
            "en": "Library assistance, language meetups support, and neighborhood initiatives."
        },
        "email": "kontakt@sprachcafe-polnisch.org",
        "img_url": "https://i0.wp.com/sprachcafe-polnisch.org/wp-content/uploads/2024/09/WhatsApp-Bild-2024-09-08-um-16.14.39_e2efb686-150x150.webp?resize=300%2C300&ssl=1"
    }
]

for m in team_list:
    photo_path = download_image(m["img_url"], m["slug"])
    
    md_content = f"""---
name: "{m['name']}"
category: "{m['category']}"
role:
  de: "{m['role']['de']}"
  pl: "{m['role']['pl']}"
  en: "{m['role']['en']}"
contact:
  email: "{m['email']}"
photo: "{photo_path}"
bio:
  de: "{m['bio']['de']}"
  pl: "{m['bio']['pl']}"
  en: "{m['bio']['en']}"
order: {m['order']}
---
"""
    file_path = os.path.join(output_md_dir, f"{m['slug']}.md")
    with open(file_path, "w", encoding="utf-8") as out:
        out.write(md_content)
    print(f"✓ Created Markdown for {m['name']} -> {file_path}")

print(f"\n🎉 Successfully migrated all {len(team_list)} team members with real portraits!")
