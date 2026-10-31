#!/usr/bin/env python3
"""
Populate real contour stickers and posters into Sticker Club.
- Extracts and converts all 600 contour-shaped sticker PNGs to optimized transparent WebP.
- Extracts and converts curated HD posters from the poster zip to optimized WebP.
- Generates src/data/realProducts.ts with rich titles, categories, pricing, and descriptions.
"""

import os
import sys
import io
import json
import zipfile
import re
from concurrent.futures import ThreadPoolExecutor
from PIL import Image

BASE_DIR = '/home/vydhikreddy/sticker-club'
STICKER_ZIP = '/home/vydhikreddy/Downloads/600-Contour-Shaped-Stickers.zip'
POSTER_ZIP = '/home/vydhikreddy/Downloads/Poster-20261030T190210Z-1-001.zip'

STICKERS_OUT_DIR = os.path.join(BASE_DIR, 'public/products/stickers')
POSTERS_OUT_DIR = os.path.join(BASE_DIR, 'public/products/posters')
TS_OUT_PATH = os.path.join(BASE_DIR, 'src/data/realProducts.ts')

os.makedirs(STICKERS_OUT_DIR, exist_ok=True)
os.makedirs(POSTERS_OUT_DIR, exist_ok=True)

# -----------------------------------------------------------------------------
# Name & Description Generators
# -----------------------------------------------------------------------------

THEME_DATA = {
    'Anime': {
        'collection': 'anime',
        'tags': ['anime', 'japanese', 'manga', 'otaku', 'die-cut', 'chibi', 'illustration'],
        'titles': [
            'Shadow Shinobi', 'Cyberpunk Ronin', 'Spirit Guardian', 'Titan Slayer',
            'Neon Alchemist', 'Moonlight Blossom', 'Dragon Flame', 'Boba Fox',
            'Mecha Wing', 'Demon Hunter Crest', 'Chibi Warrior', 'Tokyo Drift Girl',
            'Solar Knight', 'Valkyrie Grace', 'Mystic Sorcerer', 'Cat Sensei',
            'Soul Reaper', 'Pixel Ninja', 'Cosmic Explorer', 'Phantom Assassin',
            'Blade Master', 'Starfall Priestess', 'Samurai Sunset', 'Cyber Oni',
            'Kitsune Spirit', 'Aura Striker', 'Sakura Dreamer', 'Electric Spark'
        ],
        'desc_templates': [
            "Features crisp Japanese anime-inspired artwork printed on ultra-durable, waterproof vinyl with an 8px protective white contour outline. High-pigment inks deliver brilliant color depth that won't fade under sunlight. Perfect for decorating laptops, iPad cases, gaming consoles, water bottles, and sketchbook covers.",
            "Precision die-cut contour sticker showcasing dynamic anime artistry. Printed on premium scratch-resistant vinyl designed to handle daily campus wear, backpack friction, and indoor/outdoor weather. Looks stunning on laptop lids, phone grips, helmets, and vehicle glass.",
            "Vibrant anime character illustration engineered into a clean contour die-cut silhouette. Coated with a satin matte finish that feels smooth to the touch while resisting smudges, moisture, and UV rays."
        ]
    },
    'Cars': {
        'collection': 'quotes', # Maps to Cars & Bikes
        'tags': ['cars', 'automotive', 'supercar', 'racing', 'jdm', 'track', 'motorsport'],
        'titles': [
            'Midnight Skyline GTR', 'Twin-Turbo Apex', 'Monaco GP Supercar', 'JDM Drift Missile',
            'Redline GT3 Racer', 'Formula Speed Beast', 'Rotary Legend RX', 'V8 Muscle Heritage',
            'Turbocharged Horizon', 'Track-Day Aero Coupe', 'Rally Stage Special', 'Circuit Apex Predator',
            'Blackline Hypercar', 'Silverstone Classic', 'Speedway Champion', 'Drift King Silhouette',
            'Twin-Cam Turbo Icon', 'Supercharged Velocity', 'Nürburgring Record', 'Pikes Peak Hillclimber',
            'Heritage Boxer GT', 'Stuttgart Legend', 'Modena Thoroughbred', 'Monza Pole Position'
        ],
        'desc_templates': [
            "High-octane automotive die-cut vinyl sticker celebrating speed, horsepower, and track heritage. Printed with weather-proof, scratch-resistant ink on thick vinyl backing with a clean white contour cut. Built for car rear windows, toolboxes, laptops, and track-day helmets.",
            "Sleek supercar silhouette crafted into a precision die-cut decal. Heavy-duty vinyl formulation resists harsh sun, rainfall, and repeated washes without peeling or fading. Perfect for gearheads, sim racers, and car culture fans.",
            "Motorsport-inspired contour sticker featuring immaculate automotive lines. Designed for laptop lids, phone backs, garage fridges, and notebooks."
        ]
    },
    'Bikes': {
        'collection': 'quotes', # Maps to Cars & Bikes
        'tags': ['bikes', 'motorcycle', 'superbike', 'motogp', 'rider', 'racing', 'biker'],
        'titles': [
            'Superbike Apex Predator', 'Café Racer Twin', 'Trackside Knee-Down', 'MotoGP Throttle King',
            'Vintage Scrambler 500', 'Urban Stunt Rider', 'Dual-Sport Adventure', 'Brembo Brake Apex',
            'Crossplane Screamer', 'Isle of Man Racer', 'Two-Stroke Smoke', 'Midnight Cruiser Bobber',
            'Carbon Superleggera', 'Desert Rally Enduro', 'Triple Cylinder Torque', 'Helmet Visor Stalker'
        ],
        'desc_templates': [
            "Aggressive superbike contour die-cut sticker printed on heavy-grade vinyl with an anti-abrasion protective topcoat. Engineered to stay glued on bike fairings, helmet shells, visor edges, laptops, and water flasks.",
            "Two-wheel passion distilled into an unmistakable contour die-cut decal. Designed to resist wind resistance, grease, and rain while showcasing motorcycle performance culture at its finest.",
            "High-grip vinyl contour sticker designed for riders. Sticks cleanly to curved helmet contours, laptop lids, toolbox doors, and fuel tanks."
        ]
    },
    'Devotion': {
        'collection': 'motivation',
        'tags': ['devotion', 'spiritual', 'sacred', 'divine', 'peace', 'positivity', 'temple'],
        'titles': [
            'Trishul Sacred Energy', 'Mahadev Divine Grace', 'Omkara Eternal Sound', 'Hanuman Courage Shield',
            'Ganesha Auspicious Blessing', 'Krishna Flute Melody', 'Shakti Lotus Glow', 'Tirupati Balaji Radiance',
            'Nataraja Cosmic Dance', 'Ayodhya Sacred Crest', 'Surya Solar Radiance', 'Durga Fearless Roar',
            'Bhakti Serene Lotus', 'Shiva Rudraksha Aura', 'Dharma Wheel Light', 'Sudarshana Chakra Shield'
        ],
        'desc_templates': [
            "A reverent, artfully contoured devotional sticker designed to bring peace, strength, and divine energy to your daily routine. Printed on archival UV-resistant vinyl with an 8px clean white halo. Ideal for car dashboards, laptops, study desks, and puja corners.",
            "Sacred spiritual motif contoured to perfection. High-definition gold and jewel-tone pigment reproduction that creates an aura of calm and reverence wherever you place it.",
            "Premium devotional die-cut sticker made to accompany you on laptops, vehicle windscreens, phone cases, and diaries with auspicious blessing and protection."
        ]
    },
    'Music': {
        'collection': 'music',
        'tags': ['music', 'retro', 'audiophile', 'headphones', 'sound', 'beats', 'vinyl'],
        'titles': [
            'Lo-Fi Beats Cassette', 'Studio Monitor Headphones', 'Vinyl Groove Turntable', 'Bassline Equalizer Wave',
            'Acoustic Melody Guitar', 'Vintage Mic Icon', 'Synthwave Horizon Wave', 'Subwoofer Low-End King',
            'Soundtrack of Life', 'Audio Spectrum Pulse', 'Boombox 90s Street', 'Hi-Fi Turntable Needle'
        ],
        'desc_templates': [
            "For music lovers, bedroom beatmakers, and audiophiles. Features vibrant musical iconography die-cut on tear-proof vinyl with a satin matte surface. Perfect on audio interface cases, guitar cases, headphone stands, and laptop lids.",
            "Celebrate your soundtrack everywhere you go with this high-contrast music contour sticker. Resistant to coffee spills, everyday friction, and backpack transit.",
            "Rhythm-inspired die-cut sticker celebrating vinyl records, cassettes, and analog warm sound. Looks legendary on synthesizers, guitar amps, laptop cases, and journals."
        ]
    },
    'Sports': {
        'collection': 'motivation',
        'tags': ['sports', 'athlete', 'champion', 'fitness', 'football', 'cricket', 'game'],
        'titles': [
            'Number 10 Playmaker', 'Clutch Jump Shot', 'Grand Slam Champion', 'Cover Drive Maestro',
            'Iron Will Marathoner', 'Crosscourt Spike', 'Heavyweight Boxing Crest', 'Golden Boot Striker',
            'Full Throttle Sprinter', 'Cricket Yorker Special', 'Court Vision Point Guard', 'Trophy Lift Glory'
        ],
        'desc_templates': [
            "Engineered for athletes, gym goers, and dedicated sports fans. Printed on sweat-resistant, waterproof vinyl that survives dishwashers, gym bags, and intense athletic training environments. Looks sharp on shaker bottles, lockers, bat handles, and notebooks.",
            "Celebrate championship spirit with this bold contour die-cut sports sticker. Features an 8px white contour outline that stands out boldly against dark gym flasks and laptop lids.",
            "High-energy athletic contour decal for anyone chasing greatness. Tear-proof, fade-proof, and designed to inspire daily hustle."
        ]
    },
    'TFI': {
        'collection': 'movies',
        'tags': ['movies', 'tfi', 'cinema', 'tollywood', 'mass', 'telugu', 'blockbuster'],
        'titles': [
            'Deccan Cinema Mass Hero', 'Tollywood Action Dynamite', 'Rebel Star Blockbuster', 'Pan-India Box Office King',
            'Vintage Telugu Screen Icon', 'Cinematic Roar Hero', 'Interval Bang Fire', 'Mass Maharaja Swagger',
            'Whistle Podu Telugu Mass', 'Folk Beat Telugu King', 'Epic Battle Gladiator', 'Silver Screen Legend'
        ],
        'desc_templates': [
            "Pure whistling-worthy cinema energy captured in an ultra-crisp die-cut sticker! Made for die-hard Telugu and South cinema fans who celebrate film larger than life. Printed on premium thick vinyl that looks legendary on laptop lids, bike fairings, and autos.",
            "Mass cinema pride in an electric contour-cut decal. High-contrast colors, scratch-resistant matte coat, and 100% waterproof adhesion for phones, laptops, and vehicles.",
            "Celebrate iconic cinema moments with this exclusive die-cut sticker. High-definition print with precision contour edging that pops on any surface."
        ]
    }
}

POSTER_THEME_DATA = {
    'Anime': {
        'collection': 'anime',
        'tags': ['poster', 'anime', 'wall art', 'japanese', 'manga', 'room decor'],
        'title_prefix': 'Anime Masterpiece',
        'desc': 'Archival-grade Japanese animation art print reproduced with vivid cinematic color on 300 GSM heavy matte cardstock. Transforms empty hostel, bedroom, or studio walls into an immersive aesthetic gallery.'
    },
    'Cars': {
        'collection': 'quotes',
        'tags': ['poster', 'cars', 'automotive', 'supercar', 'racing', 'wall art'],
        'title_prefix': 'Supercar Heritage',
        'desc': 'High-definition motorsport print celebrating automotive performance, legendary circuits, and design engineering. Printed on 300 GSM anti-glare museum art paper for stunning clarity when framed or taped.'
    },
    'Bikes': {
        'collection': 'quotes',
        'tags': ['poster', 'bikes', 'motorcycle', 'superbike', 'motogp', 'wall art'],
        'title_prefix': 'Superbike Velocity',
        'desc': 'Electrifying motorcycle wall print capturing apex angles, throttle speed, and two-wheel freedom. Printed on heavyweight 300 GSM paper designed to resist fading and curling over time.'
    },
    'Devotion': {
        'collection': 'motivation',
        'tags': ['poster', 'devotion', 'spiritual', 'sacred', 'divine', 'wall art'],
        'title_prefix': 'Divine Sacred Grace',
        'desc': 'A magnificent spiritual art print crafted to radiate serenity, positivity, and sacred energy throughout your home, study room, or office. Printed with fade-resistant archival pigment inks.'
    },
    'Music': {
        'collection': 'music',
        'tags': ['poster', 'music', 'soundwave', 'audiophile', 'retro', 'wall art'],
        'title_prefix': 'Soundtrack Canvas',
        'desc': 'Iconic music tribute poster printed on 300 GSM heavyweight paper. An essential wall piece for music producers, vinyl listeners, and room decorators who want their space to hum with rhythm.'
    },
    'Sports': {
        'collection': 'motivation',
        'tags': ['poster', 'sports', 'champion', 'stadium', 'athlete', 'wall art'],
        'title_prefix': 'Championship Glory',
        'desc': 'Inspiring athletic victory poster designed for workout rooms, study desks, and bedroom spaces. Captures the dedication, stadium roar, and triumph of world-class athletes.'
    },
    'TFI': {
        'collection': 'movies',
        'tags': ['poster', 'movies', 'tfi', 'cinema', 'tollywood', 'wall art'],
        'title_prefix': 'Deccan Cinema Canvas',
        'desc': 'Larger-than-life Tollywood cinema artwork honoring blockbuster storytelling and legendary stars. Printed with rich contrast and deep blacks on 300 GSM museum cardstock.'
    },
    'Asthetic': {
        'collection': 'minimal',
        'tags': ['poster', 'minimal', 'aesthetic', 'art', 'interior', 'wall art'],
        'title_prefix': 'Aesthetic Minimal',
        'desc': 'Understated, tranquil art print designed with calm palettes and timeless geometry. Pairs beautifully with modern desk setups, indoor plants, and natural wood frames.'
    },
    'Vechiles': {
        'collection': 'quotes',
        'tags': ['poster', 'cars', 'vehicles', 'automotive', 'vintage', 'wall art'],
        'title_prefix': 'Vintage Motor Classic',
        'desc': 'Timeless classic vehicle poster printed on heavy archival cardstock. Captures the golden age of automotive adventure with warm tones and vintage typography.'
    }
}

# -----------------------------------------------------------------------------
# 1. Extract & Convert 600 Stickers
# -----------------------------------------------------------------------------

def process_sticker(item):
    zip_path, member_name, out_filename = item
    try:
        with zipfile.ZipFile(zip_path, 'r') as z:
            data = z.read(member_name)
        img = Image.open(io.BytesIO(data))
        # Save as WebP with lossless/high-quality alpha
        out_path = os.path.join(STICKERS_OUT_DIR, out_filename)
        img.save(out_path, format='WEBP', quality=90, method=2)
        return True
    except Exception as e:
        print(f"Error processing sticker {member_name}: {e}")
        return False

def extract_all_stickers():
    print("Processing 600 contour-shaped stickers...")
    with zipfile.ZipFile(STICKER_ZIP, 'r') as z:
        manifest_data = json.loads(z.read('600-Contour-Shaped-Stickers/source-index-and-quality.json').decode('utf-8'))
        images = manifest_data['images']

    tasks = []
    sticker_products = []

    for i, info in enumerate(images):
        num = info['number']
        cat = info['category']
        src_member = '600-Contour-Shaped-Stickers/' + info['sticker_file']
        webp_name = f"stk-{num:03d}.webp"
        tasks.append((STICKER_ZIP, src_member, webp_name))

        # Generate metadata
        theme = THEME_DATA.get(cat, THEME_DATA['Anime'])
        titles = theme['titles']
        title_base = titles[i % len(titles)]
        if i >= len(titles):
            title = f"{title_base} #{num}"
        else:
            title = f"{title_base} Die-Cut"

        slug = f"stk-{cat.lower()}-{num:03d}-{re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')}"
        short_desc = f"Contour die-cut {cat.lower()} sticker with precision white border."
        desc = theme['desc_templates'][i % len(theme['desc_templates'])]
        
        # Price: affordable student stickers
        price = 25 if cat in ['Anime', 'Cars', 'TFI'] else 20
        
        sticker_products.append({
            'id': f"stk-real-{num:03d}",
            'slug': slug,
            'name': title,
            'shortDescription': short_desc,
            'description': desc,
            'price': price,
            'category': 'stickers',
            'productType': 'single',
            'collections': [theme['collection']],
            'tags': ['contour', 'sticker', 'vinyl', cat.lower()] + theme['tags'],
            'imageSrc': f"/products/stickers/{webp_name}",
            'featured': num in [1, 5, 171, 226, 230, 356, 471, 511, 576],
            'isNew': True,
            'displayOrder': 200 + num,
            'status': 'demo',
            'dimensions': '6.5 × 8.5 cm approx',
            'material': 'Heavyweight Premium Vinyl',
            'finish': 'Satin Matte with 8px White Contour Cut'
        })

    with ThreadPoolExecutor(max_workers=12) as executor:
        results = list(executor.map(process_sticker, tasks))
    
    success = sum(1 for r in results if r)
    print(f"Successfully converted {success} of {len(tasks)} stickers to WebP in {STICKERS_OUT_DIR}")
    return sticker_products

# -----------------------------------------------------------------------------
# 2. Extract & Convert Selected Posters
# -----------------------------------------------------------------------------

def process_poster(item):
    zip_path, member_name, out_filename = item
    try:
        with zipfile.ZipFile(zip_path, 'r') as z:
            data = z.read(member_name)
        img = Image.open(io.BytesIO(data))
        if img.mode != 'RGB':
            img = img.convert('RGB')
        out_path = os.path.join(POSTERS_OUT_DIR, out_filename)
        img.save(out_path, format='WEBP', quality=84, method=2)
        return True
    except Exception as e:
        print(f"Error processing poster {member_name}: {e}")
        return False

def extract_all_posters():
    print("Processing posters from poster zip...")
    with zipfile.ZipFile(POSTER_ZIP, 'r') as z:
        names = z.namelist()
        by_cat = {}
        for n in names:
            if n.endswith(('.jpg', '.jpeg', '.png', '.webp')):
                cat = n.split('/')[1].strip()
                by_cat.setdefault(cat, []).append(n)

    # Curate high impact posters from each category
    # E.g. Anime: 20, Cars: 20, Bikes: 15, Devotion: 20, Music: 15, Sports: 15, TFI: 25, Asthetic: 15, Vechiles: 10
    quotas = {
        'Anime': 22,
        'Cars': 22,
        'Bikes': 16,
        'Devotion ': 20,
        'Music ': 16,
        'Sports ': 16,
        'TFI': 26,
        'Asthetic ': 16,
        'Vechiles': 12
    }

    tasks = []
    poster_products = []
    pst_counter = 1

    for cat_key, quota in quotas.items():
        clean_cat = cat_key.strip()
        items = by_cat.get(clean_cat, by_cat.get(cat_key, []))
        selected = items[:quota]
        theme = POSTER_THEME_DATA.get(clean_cat, POSTER_THEME_DATA['Asthetic'])

        for idx, member_name in enumerate(selected):
            num = pst_counter
            pst_counter += 1
            webp_name = f"pst-{clean_cat.lower()}-{idx+1:03d}.webp"
            tasks.append((POSTER_ZIP, member_name, webp_name))

            title = f"{theme['title_prefix']} #{idx+1}"
            slug = f"pst-{clean_cat.lower()}-{idx+1:03d}-{re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')}"
            short_desc = f"Archival {clean_cat} wall poster printed on 300 GSM art paper."
            desc = theme['desc']

            poster_products.append({
                'id': f"pst-real-{num:03d}",
                'slug': slug,
                'name': title,
                'shortDescription': short_desc,
                'description': desc,
                'price': 59,
                'category': 'posters',
                'productType': 'poster',
                'collections': [theme['collection']],
                'tags': ['poster', 'wall art', clean_cat.lower()] + theme['tags'],
                'imageSrc': f"/products/posters/{webp_name}",
                'featured': idx < 3,
                'isNew': True,
                'displayOrder': 500 + num,
                'status': 'demo',
                'dimensions': 'Available in A5, A4, and A3',
                'material': '300 GSM Archival Museum Art Paper',
                'finish': 'High-Definition Matte Anti-Glare'
            })

    with ThreadPoolExecutor(max_workers=12) as executor:
        results = list(executor.map(process_poster, tasks))
    
    success = sum(1 for r in results if r)
    print(f"Successfully converted {success} of {len(tasks)} posters to WebP in {POSTERS_OUT_DIR}")
    return poster_products

# -----------------------------------------------------------------------------
# 3. Write TypeScript Data
# -----------------------------------------------------------------------------

def write_typescript(sticker_products, poster_products):
    print("Generating TypeScript product definitions...")

    lines = [
        "import type { Product, Variant } from '../types/product';",
        "",
        "const standardPosterSizes: Variant[] = [",
        "  { id: 'a5', label: 'A5', detail: '14.8 × 21 cm', price: 59 },",
        "  { id: 'a4', label: 'A4', detail: '21 × 29.7 cm', price: 89 },",
        "  { id: 'a3', label: 'A3', detail: '29.7 × 42 cm', price: 149 },",
        "];",
        "",
        "export const realStickerProducts: Product[] = ["
    ]

    for p in sticker_products:
        lines.append(f"""  {{
    id: {json.dumps(p['id'])},
    slug: {json.dumps(p['slug'])},
    name: {json.dumps(p['name'])},
    shortDescription: {json.dumps(p['shortDescription'])},
    description: {json.dumps(p['description'])},
    price: {p['price']},
    category: 'stickers',
    productType: 'single',
    collections: {json.dumps(p['collections'])},
    tags: {json.dumps(p['tags'])},
    featured: {str(p['featured']).lower()},
    isNew: true,
    displayOrder: {p['displayOrder']},
    status: 'demo',
    dimensions: {json.dumps(p['dimensions'])},
    material: {json.dumps(p['material'])},
    finish: {json.dumps(p['finish'])},
    images: [{{ src: {json.dumps(p['imageSrc'])}, alt: {json.dumps(p['name'])} }}],
    art: {{ kind: 'single', backdrop: '#0d221e', design: {{ name: {json.dumps(p['name'])}, shape: 'rounded', bg: '#FFD447', fg: '#121212', accent: '#D90A1F' }} }},
  }},""")

    lines.append("];\n")
    lines.append("export const realPosterProducts: Product[] = [")

    for p in poster_products:
        lines.append(f"""  {{
    id: {json.dumps(p['id'])},
    slug: {json.dumps(p['slug'])},
    name: {json.dumps(p['name'])},
    shortDescription: {json.dumps(p['shortDescription'])},
    description: {json.dumps(p['description'])},
    price: 59,
    variants: standardPosterSizes,
    category: 'posters',
    productType: 'poster',
    collections: {json.dumps(p['collections'])},
    tags: {json.dumps(p['tags'])},
    featured: {str(p['featured']).lower()},
    isNew: true,
    displayOrder: {p['displayOrder']},
    status: 'demo',
    dimensions: {json.dumps(p['dimensions'])},
    material: {json.dumps(p['material'])},
    finish: {json.dumps(p['finish'])},
    images: [{{ src: {json.dumps(p['imageSrc'])}, alt: {json.dumps(p['name'])} }}],
    art: {{ kind: 'poster', backdrop: '#0d221e', poster: {{ title: {json.dumps(p['name'])}, bg: '#8FD3FF', fg: '#121212', accent: '#D90A1F' }} }},
  }},""")

    lines.append("];\n")

    with open(TS_OUT_PATH, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))

    print(f"Generated {TS_OUT_PATH} with {len(sticker_products)} stickers and {len(poster_products)} posters.")

def main():
    stickers = extract_all_stickers()
    posters = extract_all_posters()
    write_typescript(stickers, posters)
    print("Done!")

if __name__ == '__main__':
    main()
