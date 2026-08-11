#!/usr/bin/env python3
"""
Import all 401 books directly from MySQL library_db into frontend/src/data/books.json
"""

import subprocess
import json
import os

def import_books_from_mysql():
    cmd = [
        'docker', 'exec', '-i', 'library_db', 
        'mysql', '--default-character-set=utf8mb4', '-uroot', '-pAljO2D1aBnyb4sQ0', 
        'library_db', '-e', 
        'SELECT id, category, author, title, publication_year, publisher, isbn, description, cover_image, location, availability_status FROM books ORDER BY id ASC;'
    ]
    
    res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    lines = res.stdout.strip().split('\n')
    headers = lines[0].split('\t')
    
    category_map = {
        'deutsch': 'Belletristik',
        'belytrystyka_polska': 'Belytrystyka polska',
        'belytrystyka_zagraniczna': 'Belytrystyka zagraniczna',
        'biografie': 'Biografien',
        'dzieciece': 'Kinder- & Jugendbuch',
        'mlodziezowe_young_adult': 'Kinder- & Jugendbuch',
        'fantasy_scifi': 'Science Fiction & Fantasy',
        'historyczne': 'Geschichte',
        'kryminal_thriller': 'Kriminalroman',
        'poezja': 'Poesie',
        'poradniki_popularnonaukowe': 'Poradniki | Popularnonaukowe',
        'reportaze_podroznicze': 'Reportagen'
    }

    locations_cycle = ['Schöneberg', 'Köpenick', 'Pankow']
    status_map = {
        'available': 'verfuegbar',
        'verfuegbar': 'verfuegbar',
        'borrowed': 'ausgeliehen',
        'ausgeliehen': 'ausgeliehen',
        'reserved': 'reserviert',
        'reserviert': 'reserviert'
    }

    fallback_cover = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop'

    books = []
    for idx, line in enumerate(lines[1:], 1):
        parts = line.split('\t')
        while len(parts) < len(headers):
            parts.append('')
        
        b_id, raw_cat, author, title, year, publisher, isbn, desc, cover, loc, avail = [p.strip() for p in parts]
        
        category = category_map.get(raw_cat, raw_cat)
        language = 'DE' if raw_cat == 'deutsch' else 'PL'
        
        if not title or title == 'NULL':
            if author and author != 'NULL':
                book_title = author
                author = 'Unbekannter Autor'
            else:
                book_title = f'Unbekannter Titel #{b_id}'
        else:
            book_title = title

        if publisher and publisher != 'NULL':
            full_author = f"{author} ({publisher})" if author and author != 'NULL' else publisher
        else:
            full_author = author if author and author != 'NULL' else 'Unbekannter Autor'
            
        if loc and loc not in ('NULL', 'Katalog SprachCafé'):
            location = loc
        else:
            location = locations_cycle[(idx - 1) % len(locations_cycle)]
            
        status = status_map.get(avail, 'verfuegbar')
        
        if cover and cover != 'NULL' and cover.startswith(('http://', 'https://')):
            cover_url = cover
        else:
            cover_url = fallback_cover
            
        if desc and desc != 'NULL':
            description = desc
        else:
            pub_year = year if (year and year != 'NULL') else 'o.A.'
            description = f"Erschienen: {pub_year} | Kategorie: {category}"
            
        book_obj = {
            "id": f"book-{b_id}",
            "title": book_title,
            "author": full_author,
            "isbn": isbn if (isbn and isbn != 'NULL') else "",
            "language": language,
            "category": category,
            "location": location,
            "status": status,
            "cover": cover_url,
            "description": description
        }
        books.append(book_obj)

    target_path = '/home/ubuntu/sprachcafe-relaunch/frontend/src/data/books.json'
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    with open(target_path, 'w', encoding='utf-8') as f:
        json.dump(books, f, ensure_ascii=False, indent=2)
        
    print(f"Erfolgreich {len(books)} Bücher aus der MySQL-DB in {target_path} importiert.")
    return len(books)

if __name__ == '__main__':
    import_books_from_mysql()
