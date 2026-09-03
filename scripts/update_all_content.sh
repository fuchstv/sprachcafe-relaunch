#!/usr/bin/env bash
set -euo pipefail

CONTENT="/home/ubuntu/sprachcafe-relaunch/frontend/src/content"

# 1. Update Locations
cat << 'MD' > "$CONTENT/locations/pankow.md"
---
name:
  de: "SprachCafé Pankow"
  pl: "SprachCafé Pankow"
  en: "SprachCafé Pankow"
address:
  street: "Schulzestr. 1"
  zip: "13187"
  city: "Berlin-Pankow"
  mapUrl: "https://maps.google.com/?q=Schulzestr.+1,+13187+Berlin"
openingHours:
  de: "Montag – Freitag: 10:00 – 18:00 Uhr (bei Veranstaltungen länger)\nSamstag & Sonntag: während der Veranstaltungen geöffnet"
  pl: "Poniedziałek – Piątek: 10:00 – 18:00 (podczas wydarzeń dłużej)\nSobota i Niedziela: podczas wydarzeń"
  en: "Monday – Friday: 10:00 – 18:00 (longer during events)\nSaturday & Sunday: during events"
description:
  de: "Unser Hauptstandort direkt an der S1 Wollankstraße mit Hausbibliothek, Begegnungsraum und Terrasse."
  pl: "Nasza główna siedziba tuż przy stacji S1 Wollankstraße z biblioteką, salą spotkań i tarasem."
  en: "Our main location near S1 Wollankstraße station featuring a library, meeting room, and terrace."
directions:
  de: "S-Bahn S1, S2, S85 bis Wollankstraße. Ausgang Schulzestraße, 20 Meter zu Fuß."
  pl: "Kolej miejska S1, S2, S85 do stacji Wollankstraße. Wyjście Schulzestraße, 20 metrów pieszo."
  en: "S-Bahn lines S1, S2, S85 to Wollankstraße. Exit Schulzestraße, 20 meters walk."
email: "kontakt@sprachcafe-polnisch.org"
image: "/images/locations/pankow.svg"
---
MD

cat << 'MD' > "$CONTENT/locations/schoeneberg.md"
---
name:
  de: "SprachCafé Schöneberg"
  pl: "SprachCafé Schöneberg"
  en: "SprachCafé Schöneberg"
address:
  street: "Hauptstraße 121 A / Gotenstr. 45"
  zip: "10827"
  city: "Berlin-Schöneberg"
  mapUrl: "https://maps.google.com/?q=Hauptstraße+121A,+10827+Berlin"
openingHours:
  de: "Während der angekündigten Veranstaltungen und Treffen geöffnet."
  pl: "Otwarte podczas zapowiedzianych wydarzeń i spotkań."
  en: "Open during scheduled events and meetups."
description:
  de: "Stadtteilzentrum & KiezRaum Schöneberg für Sprachabende und Kulturveranstaltungen."
  pl: "Centrum dzielnicowe i KiezRaum Schöneberg na wieczory językowe i wydarzenia kulturalne."
  en: "Community center & neighborhood space in Schöneberg for language evenings and cultural events."
directions:
  de: "S-Bahn S1 bis Julius-Leber-Brücke oder U7 bis Kleistpark."
  pl: "S-Bahn S1 do stacji Julius-Leber-Brücke lub U7 do Kleistpark."
  en: "S-Bahn S1 to Julius-Leber-Brücke or U7 to Kleistpark."
email: "schoeneberg@sprachcafe-polnisch.org"
image: "/images/locations/schoeneberg.svg"
---
MD

cat << 'MD' > "$CONTENT/locations/koepenick.md"
---
name:
  de: "SprachCafé Köpenick"
  pl: "SprachCafé Köpenick"
  en: "SprachCafé Köpenick"
address:
  street: "Am Wiesengraben 7a"
  zip: "12557"
  city: "Berlin-Köpenick"
  mapUrl: "https://maps.google.com/?q=Am+Wiesengraben+7a,+12557+Berlin"
openingHours:
  de: "Nachbarschaftstreff Wiesentreff: während der Veranstaltungen geöffnet."
  pl: "Spotkania sąsiedzkie Wiesentreff: otwarte podczas wydarzeń."
  en: "Neighborhood meetup Wiesentreff: open during events."
description:
  de: "Nachbarschaftstreff Wiesentreff in Köpenick für Familienkreise und Sprachausleihangebote."
  pl: "Spotkania sąsiedzkie Wiesentreff w Köpenick dla rodzin i wypożyczalni książek."
  en: "Neighborhood meetup space Wiesentreff in Köpenick for families and book lending."
directions:
  de: "Tram 62 bis Am Wiesengraben oder Bus 165."
  pl: "Tramwaj 62 do przystanku Am Wiesengraben lub autobus 165."
  en: "Tram 62 to Am Wiesengraben or Bus 165."
email: "koepenick@sprachcafe-polnisch.org"
image: "/images/locations/koepenick.svg"
---
MD

# 2. Update Shop Items
cat << 'MD' > "$CONTENT/shopItems/tshirt-sprachcafe.md"
---
name:
  de: "SprachCafé T-Shirt (Erwachsene)"
  pl: "Koszulka SprachCafé (dorośli)"
  en: "SprachCafé T-Shirt (Adults)"
description:
  de: "100% Bio-Baumwolle mit hochwertigem SprachCafé Polnisch Logo-Siebdruck. Fair und nachhaltig produziert."
  pl: "100% bawełna organiczna z sitodrukiem logo SprachCafé. Produkcja etyczna i zrównoważona."
  en: "100% organic cotton with high quality screen printed SprachCafé logo. Fair trade & sustainably made."
priceDisplay:
  de: "20 € (Spendenbeitrag)"
  pl: "20 € (darowizna)"
  en: "20 € (donation)"
image: "/images/shop/tshirt-adult.svg"
availability: "in_stock"
---
MD

cat << 'MD' > "$CONTENT/shopItems/tshirt-kinder.md"
---
name:
  de: "SprachCafé T-Shirt (Kinder)"
  pl: "Koszulka dziecięca SprachCafé"
  en: "SprachCafé Kids T-Shirt"
description:
  de: "Farbenfrohes Kinder-T-Shirt aus weicher Bio-Baumwolle. In verschiedenen Kindergrößen vor Ort erhältlich."
  pl: "Kolorowa koszulka dziecięca z miękkiej bawełny organicznej. Dostępna na miejscu w różnych rozmiarach."
  en: "Colorful kids t-shirt made of soft organic cotton. Available on-site in various child sizes."
priceDisplay:
  de: "15 € (Spendenbeitrag)"
  pl: "15 € (darowizna)"
  en: "15 € (donation)"
image: "/images/shop/tshirt-kids.svg"
availability: "in_stock"
---
MD

cat << 'MD' > "$CONTENT/shopItems/tasche-stoff.md"
---
name:
  de: "Bio-Stoffbeutel SprachCafé"
  pl: "Eko-torba bawełniana SprachCafé"
  en: "SprachCafé Organic Tote Bag"
description:
  de: "Robuste Tragetasche aus 100% recycelter Bio-Baumwolle. Perfekt für Bibliotheksbücher und den Alltag."
  pl: "Mocna torba ze 100% bawełny organicznej z recyklingu. Idealna na książki z biblioteki i na co dzień."
  en: "Sturdy tote bag made from 100% recycled organic cotton. Perfect for library books and daily use."
priceDisplay:
  de: "10 € (Spendenbeitrag)"
  pl: "10 € (darowizna)"
  en: "10 € (donation)"
image: "/images/shop/tote-bag.svg"
availability: "in_stock"
---
MD

cat << 'MD' > "$CONTENT/shopItems/speak-dating-karten.md"
---
name:
  de: "Speak-Dating Konversationskarten"
  pl: "Karty konwersacyjne Speak-Dating"
  en: "Speak-Dating Conversation Cards"
description:
  de: "Exklusives zweisprachiges Kartenset mit Impulsfragen auf Deutsch und Polnisch für Sprachtandems und Spieleabende."
  pl: "Autorski dwujęzyczny zestaw kart z pytaniami po polsku i niemiecku do tandemu językowego i gier towarzyskich."
  en: "Exclusive bilingual card set with prompt questions in German and Polish for language tandems and game nights."
priceDisplay:
  de: "20 € (Spendenbeitrag)"
  pl: "20 € (darowizna)"
  en: "20 € (donation)"
image: "/images/shop/speak-dating-cards.svg"
availability: "in_stock"
---
MD

# 3. Update Exhibitions
cat << 'MD' > "$CONTENT/exhibitions/anna-krenz-mutige-frauen.md"
---
title:
  de: "Mutige Frauen — Porträts und Geschichten"
  pl: "Odważne Kobiety — Portrety i Historie"
  en: "Brave Women — Portraits and Stories"
artist: "Anna Krenz & Ewa Maria Slaska"
startDate: 2026-03-08
endDate: 2026-06-30
description:
  de: "Eine multimediale Ausstellung über bemerkenswerte Frauen der deutsch-polnischen Geschichte, Aktivismus und Kunst."
  pl: "Multimedialna wystawa o wybitnych kobietach historii polsko-niemieckiej, aktywizmu i sztuki."
  en: "A multimedia exhibition celebrating remarkable women of German-Polish history, activism, and art."
gallery:
  - url: "/images/exhibitions/mutige-frauen.svg"
    caption:
      de: "Plakat zur Ausstellung Mutige Frauen"
      pl: "Plakat wystawy Odważne Kobiety"
      en: "Poster for Brave Women Exhibition"
    alt:
      de: "Plakat Mutige Frauen"
      pl: "Plakat Odważne Kobiety"
      en: "Poster Brave Women"
---
MD

cat << 'MD' > "$CONTENT/exhibitions/marta-wilk-stillen-in-berlin.md"
---
title:
  de: "#Stilleninberlin — Intime Einblicke"
  pl: "#Stilleninberlin — Intymne Spojrzenia"
  en: "#Stilleninberlin — Intimate Perspectives"
artist: "Marta Wilk Photography"
startDate: 2026-01-15
endDate: 2026-04-30
description:
  de: "Einfühlsame Fotodokumentation über Mutterschaft, Familienleben und öffentliches Stillen im Berliner Stadtraum."
  pl: "Poruszający dokument fotograficzny o macierzyństwie, życiu rodzinnym i karmieniu piersią w przestrzeni Berlina."
  en: "Empathetic photo documentary on motherhood, family life, and breastfeeding in Berlin urban spaces."
gallery:
  - url: "/images/exhibitions/stillen-in-berlin.svg"
    caption:
      de: "Fotoreihe Stillen in Berlin"
      pl: "Cykl fotograficzny Karmienie w Berlinie"
      en: "Photo series Breastfeeding in Berlin"
    alt:
      de: "Fotoausstellung Marta Wilk"
      pl: "Wystawa fotograficzna Marta Wilk"
      en: "Photo Exhibition Marta Wilk"
---
MD

cat << 'MD' > "$CONTENT/exhibitions/olga-basole-sciezki.md"
---
title:
  de: "Ścieżki / Pfade — Abstrakte Malerei"
  pl: "Ścieżki — Malarstwo Abstrakcyjne"
  en: "Pathways / Ścieżki — Abstract Paintings"
artist: "Olga Basole"
startDate: 2026-05-01
endDate: 2026-08-31
description:
  de: "Farbintensive Acrylgemälde und Collagen, die Wege des interkulturellen Ankommens und der persönlichen Transformation erforschen."
  pl: "Malarstwo akrylowe i kolaże badające ścieżki międzykulturowego zakorzenienia i osobistej transformacji."
  en: "Vibrant acrylic paintings and collages exploring pathways of intercultural belonging and transformation."
gallery:
  - url: "/images/exhibitions/sciezki.svg"
    caption:
      de: "Ausstellungsübersicht Ścieżki"
      pl: "Przegląd wystawy Ścieżki"
      en: "Exhibition Overview Pathways"
    alt:
      de: "Gemälde von Olga Basole"
      pl: "Obrazy Olgi Basole"
      en: "Paintings by Olga Basole"
---
MD

# 4. Clean up and populate Team collection
rm -f "$CONTENT/team/"*.md

# Vorstand
cat << 'MD' > "$CONTENT/team/01-agata-koch.md"
---
name: "Agata Koch"
role:
  de: "Vorstandsvorsitzende & Gründerin"
  pl: "Przewodnicząca Zarządu i Założycielka"
  en: "Chairwoman & Founder"
contact:
  email: "agata.koch@sprachcafe-polnisch.org"
photo: "/images/team/avatar-default.svg"
bio:
  de: "Gründerin des SprachCafé Polnisch e.V. Seit 2008 engagiert für zweisprachige Erziehung, Nachbarschaftsdialog und interkulturelle Begegnung in Berlin."
  pl: "Założycielka SprachCafé Polnisch e.V. Od 2008 roku zaangażowana w dwujęzyczne wychowanie, dialog sąsiedzki i integrację w Berlinie."
  en: "Founder of SprachCafé Polnisch e.V. Dedicated to bilingual education, community dialogue, and intercultural exchange since 2008."
order: 1
---
MD

cat << 'MD' > "$CONTENT/team/02-elke-albers.md"
---
name: "Elke Albers"
role:
  de: "Schatzmeisterin & Vorstand"
  pl: "Skarbnik i Członkini Zarządu"
  en: "Treasurer & Board Member"
contact:
  email: "elke.albers@sprachcafe-polnisch.org"
photo: "/images/team/avatar-default.svg"
bio:
  de: "Verantwortlich für Finanzen, Fördermittelverwaltung und die buchhalterische Begleitung der Vereinsprojekte."
  pl: "Odpowiedzialna za finanse, zarządzanie dotacjami i obsługę księgową projektów stowarzyszenia."
  en: "Responsible for finances, grant management, and financial coordination of association projects."
order: 2
---
MD

cat << 'MD' > "$CONTENT/team/03-agnieszka-ghanname.md"
---
name: "Agnieszka Ghanname"
role:
  de: "Vorstand & Sozialberatung"
  pl: "Zarząd i Poradnictwo Społeczne"
  en: "Board Member & Social Counseling"
contact:
  email: "agnieszka.ghanname@sprachcafe-polnisch.org"
photo: "/images/team/avatar-default.svg"
bio:
  de: "Leitung der muttersprachlichen Sozialberatung und Koordination der Nachbarschaftshilfe."
  pl: "Prowadzenie poradnictwa społecznego w języku ojczystym i koordynacja pomocy sąsiedzkiej."
  en: "Head of native-language social counseling and coordinator of community assistance."
order: 3
---
MD

cat << 'MD' > "$CONTENT/team/04-sandra-filip-badura.md"
---
name: "Sandra Filip-Badura"
role:
  de: "Vorstand & Polnisch als Fremdsprache"
  pl: "Zarząd i Język Polski jako Obcy"
  en: "Board Member & Polish as Foreign Language"
contact:
  email: "sandra.filip@sprachcafe-polnisch.org"
photo: "/images/team/avatar-default.svg"
bio:
  de: "Konzeption und methodische Leitung der Polnischkurse für Erwachsene und Sprachtandem-Formate."
  pl: "Koncepcja i kierownictwo metodyczne kursów języka polskiego dla dorosłych oraz tandemów."
  en: "Curriculum design and methodology lead for adult Polish courses and language tandem formats."
order: 4
---
MD

cat << 'MD' > "$CONTENT/team/05-katarzyna-koziol.md"
---
name: "Katarzyna Aniela Koziol"
role:
  de: "Vorstand & Kulturkoordination"
  pl: "Zarząd i Koordynacja Kultury"
  en: "Board Member & Cultural Coordination"
contact:
  email: "katarzyna.koziol@sprachcafe-polnisch.org"
photo: "/images/team/avatar-default.svg"
bio:
  de: "Koordination von Kunstausstellungen, Kulturabenden und Kooperationen mit Kulturinstitutionen."
  pl: "Koordynacja wystaw sztuki, wieczorów kulturalnych i współpracy z instytucjami kultury."
  en: "Coordinating art exhibitions, cultural evenings, and institutional partnerships."
order: 5
---
MD

# Verwaltung & IT
cat << 'MD' > "$CONTENT/team/06-agnieszka-kubalewska.md"
---
name: "Agnieszka Kubalewska-Strohmeyer"
role:
  de: "Verwaltung & Projektmanagement"
  pl: "Administracja i Zarządzanie Projektami"
  en: "Administration & Project Management"
contact:
  email: "kontakt@sprachcafe-polnisch.org"
photo: "/images/team/avatar-default.svg"
bio:
  de: "Projektadministration, Fördermittelabrechnung und operative Koordination der Standorte."
  pl: "Administracja projektów, rozliczenia dotacji i operacyjna koordynacja placówek."
  en: "Project administration, grant accounting, and operational coordination across branches."
order: 6
---
MD

cat << 'MD' > "$CONTENT/team/07-dorota-stasinska.md"
---
name: "Dorota Stasińska"
role:
  de: "Verwaltung & Mitgliederbetreuung"
  pl: "Administracja i Obsługa Członków"
  en: "Administration & Member Relations"
contact:
  email: "kontakt@sprachcafe-polnisch.org"
photo: "/images/team/avatar-default.svg"
bio:
  de: "Mitgliederverwaltung, Beitragsabstimmung und Büroorganisation in Pankow."
  pl: "Ewidencja członków, rozliczanie składek i organizacja biura w Pankow."
  en: "Membership administration, contribution management, and office organization in Pankow."
order: 7
---
MD

cat << 'MD' > "$CONTENT/team/08-philipp-fuchs.md"
---
name: "Philipp Fuchs"
role:
  de: "IT, Webportal & Digitalisierung"
  pl: "IT, Portal Internetowy i Cyfryzacja"
  en: "IT, Web Portal & Digital Infrastructure"
contact:
  email: "p.fuchs@sprachcafe-polnisch.org"
photo: "/images/team/avatar-default.svg"
bio:
  de: "Entwicklung und Betreuung des Astro-Webportals, der Online-Hausbibliothek und der M365-Automatisierung."
  pl: "Tworzenie i opieka nad portalem Astro, biblioteką cyfrową oraz automatyzacją M365."
  en: "Development and maintenance of the Astro web portal, digital library, and M365 automation."
order: 8
---
MD

cat << 'MD' > "$CONTENT/team/09-leokadia-rospek.md"
---
name: "Leokadia Rospek"
role:
  de: "Pädagogin & Leitung Klub Malucha"
  pl: "Pedagog i Prowadząca Klub Malucha"
  en: "Educator & Lead for Toddler Club"
contact:
  email: "l.rospek@sprachcafe-polnisch.org"
photo: "/images/team/avatar-default.svg"
bio:
  de: "Sensorisch-kreative Frühförderung für Kleinkinder (1–3 Jahre) und Eltern-Kind-Gruppen in Schöneberg und Köpenick."
  pl: "Sensoryczno-kreatywne zajęcia wczesnorozwojowe dla maluszków (1–3 lat) i grup rodzinnych w Schöneberg i Köpenick."
  en: "Sensory and creative early childhood education for toddlers (1–3 years) and family groups in Schöneberg and Köpenick."
order: 9
---
MD

cat << 'MD' > "$CONTENT/team/10-grzegorz-szklarczuk.md"
---
name: "Grzegorz Szklarczuk"
role:
  de: "Pädagoge & Jugendprojekte"
  pl: "Pedagog i Projekty Młodzieżowe"
  en: "Educator & Youth Projects"
contact:
  email: "kontakt@sprachcafe-polnisch.org"
photo: "/images/team/avatar-default.svg"
bio:
  de: "Medienpädagogik, Jugend-Workshops und Sprachförderung für Schulkinder."
  pl: "Pedagogika medialna, warsztaty młodzieżowe i edukacja językowa dla dzieci w wieku szkolnym."
  en: "Media education, youth workshops, and language support for school-age children."
order: 10
---
MD

cat << 'MD' > "$CONTENT/team/11-magdalena-wadas.md"
---
name: "Magdalena Wadas"
role:
  de: "Pädagogin & Sprachförderung"
  pl: "Pedagog i Edukacja Językowa"
  en: "Educator & Language Tutoring"
contact:
  email: "kontakt@sprachcafe-polnisch.org"
photo: "/images/team/avatar-default.svg"
bio:
  de: "Kinder-Sprachkurse, Theaterpädagogik und Vorleseformate in Pankow und Schöneberg."
  pl: "Kursy językowe dla dzieci, pedagogika teatralna i czytanie bajek w Pankow i Schöneberg."
  en: "Children's language courses, theater pedagogy, and storytelling workshops in Pankow and Schöneberg."
order: 11
---
MD

cat << 'MD' > "$CONTENT/team/12-karolina-zuczek.md"
---
name: "Karolina Żuczek"
role:
  de: "Pädagogin & Kunstworkshops"
  pl: "Pedagog i Warsztaty Artystyczne"
  en: "Educator & Art Workshops"
contact:
  email: "kontakt@sprachcafe-polnisch.org"
photo: "/images/team/avatar-default.svg"
bio:
  de: "Kreativwerkstätten, Malerei und handwerkliche Kurse für Kinder und Jugendliche."
  pl: "Warsztaty kreatywne, malarstwo i zajęcia plastyczne dla dzieci i młodzieży."
  en: "Creative arts, painting, and craft workshops for children and youth."
order: 12
---
MD

cat << 'MD' > "$CONTENT/team/13-joanna-ceremuga.md"
---
name: "Joanna Ceremuga"
role:
  de: "Pädagogin & Sprachanimation"
  pl: "Pedagog i Animacja Językowa"
  en: "Educator & Language Animation"
contact:
  email: "kontakt@sprachcafe-polnisch.org"
photo: "/images/team/avatar-default.svg"
bio:
  de: "Interaktive Sprachspielgruppen und Deutsch-Polnische Nachbarschaftstreffen."
  pl: "Interaktywne grupy językowe i polsko-niemieckie spotkania sąsiedzkie."
  en: "Interactive language playgroups and German-Polish community gatherings."
order: 13
---
MD

cat << 'MD' > "$CONTENT/team/14-basia-stillmark.md"
---
name: "Basia Stillmark"
role:
  de: "Pädagogin & Frühförderung"
  pl: "Pedagog i Wczesna Edukacja"
  en: "Educator & Early Childhood"
contact:
  email: "kontakt@sprachcafe-polnisch.org"
photo: "/images/team/avatar-default.svg"
bio:
  de: "Musik- und Rhythmikpädagogik für Kleinkinder und zweisprachige Eltern-Kind-Kreise."
  pl: "Zajęcia muzyczno-rytmiczne dla maluchów i dwujęzyczne kręgi rodzinne."
  en: "Music and rhythm pedagogy for toddlers and bilingual family circles."
order: 14
---
MD

cat << 'MD' > "$CONTENT/team/15-hausbibliothek.md"
---
name: "Hausbibliothek & Ehrenamts-Team"
role:
  de: "Bibliotheksbetreuung & Ausleihservice"
  pl: "Opieka nad Biblioteką i Wypożyczalnia"
  en: "Library Curators & Lending Support"
contact:
  email: "bibliothek@sprachcafe-polnisch.org"
photo: "/images/team/avatar-default.svg"
bio:
  de: "Katalogpflege von über 400 Werken, Buchankauf und Betreuung der Lesenden in Pankow und Köpenick."
  pl: "Katalogowanie ponad 400 pozycji, zakup nowości i pomoc czytelnikom w Pankow i Köpenick."
  en: "Cataloging over 400 volumes, acquisitions, and lending support in Pankow and Köpenick."
order: 15
---
MD

echo "✓ Content successfully updated and synchronized!"
