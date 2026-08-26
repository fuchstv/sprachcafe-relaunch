# Hausbibliothek Read-Only Catalog Sync Report

- **Mode**: LIVE BUILD SYNC
- **Timestamp**: 2026-08-26T22:43:50.359Z
- **Source Export API**: `https://hausbibliothek.org/api/books?limit=500`
- **Target File**: `/home/ubuntu/sprachcafe-relaunch/frontend/src/data/books.json`

## Catalog Statistics

| Metric | Count |
|---|---|
| Total Books Processed | 401 |
| Valid ISBN-10 / ISBN-13 | 302 |
| Missing ISBNs | 56 |
| Unplausible / Invalid ISBNs | 43 |

## Category & Status Distribution

### Statuses (Availability)
- **verfuegbar**: 401

### Categories
- **Deutschsprachige Literatur**: 1
- **Polnische Belletristik**: 76
- **belytrystyka_zagraniczna**: 52
- **biografie**: 21
- **dzieciece**: 55
- **fantasy_scifi**: 7
- **historyczne**: 61
- **kryminal_thriller**: 34
- **mlodziezowe_young_adult**: 20
- **Poesie**: 28
- **poradniki_popularnonaukowe**: 22
- **reportaze_podroznicze**: 24

## ISBN Validation Warnings

| Book ID | Title | Raw ISBN | Validation Error |
|---|---|---|---|
| `book-1` | Intime Küsse | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-2` | Miazga | `907587712` | Unzulässige Zeichen oder Länge (9 Zeichen statt 10 oder 13) |
| `book-4` | Z widokiem na Mont Blanc | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-6` | Nic | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-41` | Biurwa | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-46` | Kwestia ceny | `978-830280-7219-0` | Unzulässige Zeichen oder Länge (14 Zeichen statt 10 oder 13) |
| `book-61` | Reemer Katarzyna" | `ATUT` | Unzulässige Zeichen oder Länge (4 Zeichen statt 10 oder 13) |
| `book-74` | Samotność w sieci | ` Prószyński i S-ka"` | Unzulässige Zeichen oder Länge (15 Zeichen statt 10 oder 13) |
| `book-98` | Masz nową wiadomość | `83-839371-66-9` | Unzulässige Zeichen oder Länge (11 Zeichen statt 10 oder 13) |
| `book-118` | Kompleks Portnoya | `978-83-08-05475-0` | Ungültige Prüfziffer (Erwartet: 8, Ist: 0) |
| `book-128` | Królowa serc | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-151` | (tł.) | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-152` | Adam Bernard (opr.) | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-153` | Agnieszka Nozyńska (opr.) | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-154` | Agnieszka Nozyńska (opr.) | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-155` | Anna Matusik-Dyjak (tł.) | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-156` | Barbara Puzonowicz | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-157` | Bolesław | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-158` | Bolesław | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-159` | Bolesław | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-160` | Bolesław | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-161` | Emilia kledzik (tł.) | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-162` | Katarzyna Skalska (tł.) | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-163` | Ludwiczak (tł.) | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-164` | Ludwiczak (tł.) | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-165` | Ludwiczak (tł.) | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-166` | Ludwiczak (tł.) | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-167` | Maja Porczyńska-Szarapa (tł.) | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-168` | Marek Puszczewicz (tł.) | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-169` | Marta Tychmanowicz (tł.) | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-170` | Patrycja Zarawska | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-171` | Patrycja Zarawska (tł.) | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-172` | Książka dla dzieci (4-6 lat) | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-173` | Beata Ostrowicka | `2009` | Unzulässige Zeichen oder Länge (4 Zeichen statt 10 oder 13) |
| `book-174` | Zofia Stanecka (a) | `2011` | Unzulässige Zeichen oder Länge (4 Zeichen statt 10 oder 13) |
| `book-175` | Jan Brzechwa | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-176` | Anna Sójka-Leszczyńska (opr.) | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-177` | Dorota Krassowska | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-178` | Phoebe Gilman (a) | `2015` | Unzulässige Zeichen oder Länge (4 Zeichen statt 10 oder 13) |
| `book-179` | Charles perrault (a) | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-180` | Diabeł Boruta | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-181` | Karla Kuskin (a) | `2017` | Unzulässige Zeichen oder Länge (4 Zeichen statt 10 oder 13) |
| `book-182` | Wiktor Laskowski (a) | `2016` | Unzulässige Zeichen oder Länge (4 Zeichen statt 10 oder 13) |
| `book-183` | Arianna Candell (a) | `2004` | Unzulässige Zeichen oder Länge (4 Zeichen statt 10 oder 13) |
| `book-184` | Annie M.G. Schmidt (a) | `2018` | Unzulässige Zeichen oder Länge (4 Zeichen statt 10 oder 13) |
| `book-185` | Grzegorz Kasdepke | `2010` | Unzulässige Zeichen oder Länge (4 Zeichen statt 10 oder 13) |
| `book-186` | Agnieszka Nozyńska (opr.) | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-187` | Agnieszka Nozyńska (opr.) | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-188` | Robert Romanowicz (a) | `2014` | Unzulässige Zeichen oder Länge (4 Zeichen statt 10 oder 13) |
| `book-189` | Aleksander Fredro | `2010` | Unzulässige Zeichen oder Länge (4 Zeichen statt 10 oder 13) |
| `book-190` | Ralf Butschkow (a) | `2008` | Unzulässige Zeichen oder Länge (4 Zeichen statt 10 oder 13) |
| `book-191` | Ralf Butschkow (a) | `2012` | Unzulässige Zeichen oder Länge (4 Zeichen statt 10 oder 13) |
| `book-192` | Susanne Schürmann (a) | `2008` | Unzulässige Zeichen oder Länge (4 Zeichen statt 10 oder 13) |
| `book-193` | Monika Wittmann (a) | `2012` | Unzulässige Zeichen oder Länge (4 Zeichen statt 10 oder 13) |
| `book-194` | Mo Willems (a) | `2017` | Unzulässige Zeichen oder Länge (4 Zeichen statt 10 oder 13) |
| `book-195` | Diana Chwała (tł.) | `2011` | Unzulässige Zeichen oder Länge (4 Zeichen statt 10 oder 13) |
| `book-196` | Agnieszka Nozyńska (opr.) | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-197` | Agnieszka Nozyńska (opr.) | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-198` | Agnieszka Nozyńska (opr.) | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-199` | Ramona Badescu (a) | `2015` | Unzulässige Zeichen oder Länge (4 Zeichen statt 10 oder 13) |
| `book-200` | Jan Brzechwa | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-201` | Jacob & Wilhelm Grimm | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-202` | Kazimierz Władysław Wójcicki (a) | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-203` | Aurore Gauthier (a) | `2019` | Unzulässige Zeichen oder Länge (4 Zeichen statt 10 oder 13) |
| `book-204` | Thierry Lenain (a) | `2014` | Unzulässige Zeichen oder Länge (4 Zeichen statt 10 oder 13) |
| `book-205` | Liane Schneider (a) | `2011` | Unzulässige Zeichen oder Länge (4 Zeichen statt 10 oder 13) |
| `book-213` | Magazyn Polonia / nr2 | `ISSN 2197-9324` | Unzulässige Zeichen oder Länge (12 Zeichen statt 10 oder 13) |
| `book-214` | Magazyn Polonia / nr5 | `ISSN 2197-9324` | Unzulässige Zeichen oder Länge (12 Zeichen statt 10 oder 13) |
| `book-216` | Na frontach antyhitlerowskiej wojny / Album znaczków pocztowych | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-219` | 50 Jahre Görlitzer Abkommen | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-220` | Das alte Polen | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-227` | Poczet królów i książąt polskich | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-234` | Tysiąc lat monety polskiej | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-235` | Polacy w Chinach | `83-211-135-2` | Unzulässige Zeichen oder Länge (9 Zeichen statt 10 oder 13) |
| `book-239` | W kręgu lekarskiej wspólnoty | `83-89989-24-1` | Ungültige ISBN-10 Prüfziffer (Modulo 11 Fehlschlag) |
| `book-246` | Zagłada Żydów | `ISSN 1895-247X` | Unzulässige Zeichen oder Länge (12 Zeichen statt 10 oder 13) |
| `book-250` | Jahrbuch Weichsel-Warthe | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-251` | Polski Berlin | `978-89691-646-7` | Unzulässige Zeichen oder Länge (12 Zeichen statt 10 oder 13) |
| `book-255` | Gemeinsam für ein soziales und bürgerschaftliches Europa | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-256` | Beitrag Polens und der Polen zum Sieg der Alliierten im II. Welkrieg | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-266` | Zarys dziejów Polonii niemieckiej z informatorem | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-269` | Budujemy mosty | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-270` | 7 polskich grzechów głównych | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-271` | Encyklopedia Powstań Śląskich | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-272` | Kościół Katolicki i relacje polsko-niemieckie po 1945r. | `987-83-939223-9-0` | ISBN-13 muss mit 978 oder 979 beginnen |
| `book-280` | Noc w bibliotece | `978–83-245-8667-7` | Unzulässige Zeichen oder Länge (14 Zeichen statt 10 oder 13) |
| `book-281` | Pajęczyna | `978–83-245-8861-9` | Unzulässige Zeichen oder Länge (14 Zeichen statt 10 oder 13) |
| `book-285` | Kółko się pani urwało | `978-83-28-6362-4` | Unzulässige Zeichen oder Länge (12 Zeichen statt 10 oder 13) |
| `book-324` | -?... -Zapytał czas | `83-86129-94-4` | Ungültige ISBN-10 Prüfziffer (Modulo 11 Fehlschlag) |
| `book-332` | Wybór poezji | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-333` | Kolory | `978-83-919140-1-6` | Ungültige Prüfziffer (Erwartet: 4, Ist: 6) |
| `book-337` | To lubię… | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-354` | Mantry | `978-83-934228-9` | Unzulässige Zeichen oder Länge (12 Zeichen statt 10 oder 13) |
| `book-369` | Huppert Lena" | `Świat Książki` | Unzulässige Zeichen oder Länge (12 Zeichen statt 10 oder 13) |
| `book-371` | Polska filozofia człowieka | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-373` | Po drugiej stronie lustra | `N/A` | ISBN ist leer oder nicht angegeben |
| `book-375` | Świętowanie Życia | `978-83-08-08803` | Unzulässige Zeichen oder Länge (12 Zeichen statt 10 oder 13) |
| `book-392` | Być Polakiem w Niemczech | `83-87668-05-3` | Ungültige ISBN-10 Prüfziffer (Modulo 11 Fehlschlag) |
| `book-396` | Domagalik Małgorzata" | `W.A.B.` | Unzulässige Zeichen oder Länge (3 Zeichen statt 10 oder 13) |

---
*Note: The Library App (hausbibliothek.org) remains the permanent single source of truth for loan transactions, user accounts, and active reservations.*
