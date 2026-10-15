# Image inventory

All paths are rooted at `public/images`; `.webp` and `.avif` files are auto-generated from the original `.jpg` copies by `npm run optimize-images`. Source originals are safely retained untouched in `incoming-photos/downloaded/`. Archived/duplicate files are safely preserved in `_removed-photos/`.

## Filled slots (Active Photography)

| Slot | Asset | Status / source |
|---|---|---|
| **Homepage Hero Slide 1** | `destinations/sigiriya/hero.webp` | Sigiriya Lion Rock 5th-century citadel (Wikimedia Commons CC BY-SA 3.0) |
| **Homepage Hero Slide 2** | `destinations/ella/hero.webp` | Nine Arch Bridge with red train in Ella (Wikimedia Commons CC BY-SA 4.0) |
| **Homepage Hero Slide 3** | `hero/hikkaduwa.webp` | Golden sunset over Hikkaduwa palm coastline (Wikimedia Commons CC BY-SA 4.0) |
| **Homepage Hero Slide 4** | `experiences/minneriya-elephants.webp` | Wild Asian elephant gathering at Minneriya (Wikimedia Commons CC BY-SA 2.0) |
| **Pillar 1: Wild** | `destinations/yala-national-park/hero.webp` | Yala Sri Lankan leopard resting on boulder (Wikimedia Commons CC BY-SA 4.0) |
| **Pillar 2: Pristine** | `experiences/mirissa-whale.webp` | Blue whale fluke in Indian Ocean swell (Wikimedia Commons CC BY 2.0) |
| **Pillar 3: Bliss** | `destinations/nuwara-eliya/hero.webp` | High-altitude rolling tea estates in Nuwara Eliya (Wikimedia Commons CC BY-SA 4.0) |
| **Pillar 4: Scenic** | `destinations/ella/hero.webp` | Nine Arch Bridge viaduct rail journey (Wikimedia Commons CC BY-SA 4.0) |
| **Pillar 5: Thrills** | `experiences/sigiriya-sunrise-climb/hero.webp` | Sunrise expedition on Pidurangala overlooking Sigiriya (Wikimedia Commons CC BY-SA 4.0) |
| **Pillar 6: Festive** | `destinations/kandy/gallery-1.webp` | Temple of the Sacred Tooth Relic, Kandy (Wikimedia Commons CC BY 2.0) |
| **Pillar 7: Heritage** | `destinations/polonnaruwa/hero.webp` | Ancient UNESCO medieval ruins of Polonnaruwa (Wikimedia Commons CC BY 2.0) |
| **Pillar 8: Essence** | `destinations/galle-fort/hero.webp` | Galle Dutch Fort ocean ramparts & lighthouse (Wikimedia Commons CC BY-SA 4.0) |
| **Sigiriya Destination Hero** | `destinations/sigiriya/hero.webp` | Monolith view from water gardens (CC BY-SA 3.0) |
| **Sigiriya Gallery 1** | `destinations/sigiriya/gallery-1.webp` | Dawn vista of Sigiriya from Pidurangala summit (CC BY-SA 4.0) |
| **Sigiriya Gallery 2** | `destinations/sigiriya/gallery-2.webp` | Wild Asian elephant gathering corridor at Minneriya (CC BY-SA 2.0) |
| **Sigiriya Gallery 3** | `destinations/sigiriya/gallery-3.webp` | Historic kingdom ruins of Polonnaruwa (CC BY 2.0) |
| **Kandy Destination Hero** | `destinations/kandy/hero.webp` | Royal palm avenue at Peradeniya Botanical Gardens (CC BY 4.0) |
| **Kandy Gallery 1** | `destinations/kandy/gallery-1.webp` | Temple of the Sacred Tooth Relic (CC BY 2.0) |
| **Nuwara Eliya Hero** | `destinations/nuwara-eliya/hero.webp` | Lush tea fields near Nanuoya (CC BY-SA 4.0) |
| **Ella Destination Hero** | `destinations/ella/hero.webp` | Nine Arch Bridge with red train (CC BY-SA 4.0) |
| **Mirissa Destination Hero** | `destinations/mirissa/hero.webp` | Blue whale fluke off Mirissa (CC BY 2.0) |
| **Mirissa Gallery 1** | `destinations/mirissa/gallery-1.webp` | Golden sand palm beach and surf in Mirissa (CC BY-SA 4.0) |
| **Galle Fort Destination Hero** | `destinations/galle-fort/hero.webp` | White lighthouse & palm trees (CC BY-SA 4.0) |
| **Yala National Park Hero** | `destinations/yala-national-park/hero.webp` | Leopard on sun-warmed rock (CC BY-SA 4.0) |
| **Polonnaruwa Destination Hero**| `destinations/polonnaruwa/hero.webp` | Ancient stone pillars and royal pavilions (CC BY 2.0) |
| **Trincomalee Destination Hero** | `destinations/trincomalee/hero.webp` | Nilaveli turquoise coastal waters (CC BY-SA 4.0) |
| **Tour: Grand Odyssey** | `destinations/sigiriya/hero.webp` | Route-matched signature citadel |
| **Tour: Cultural Triangle** | `destinations/polonnaruwa/hero.webp` | Ancient UNESCO kingdom ruins |
| **Tour: Southern Coast** | `destinations/mirissa/hero.webp` | Blue whale & marine wildlife |
| **Tour: Honeymoon Escape** | `destinations/galle-fort/hero.webp` | Romantic Galle Fort lighthouse |
| **Tour: Wild Lanka Safari** | `destinations/yala-national-park/hero.webp` | Yala National Park leopard |
| **Tour: Highlights Express** | `destinations/ella/hero.webp` | Nine Arch Bridge highland railway |

## Placeholders retained with SafeImage

To maintain authentic representation without misrepresenting locations or people, the following slots display neutral luxury placeholders (`SafeImage`) until custom photography is provided:
1. **Haputale & Lipton's Seat**: No confirmed photograph of Lipton's Seat in the current set.
2. **Founder Portrait (`/images/team/manju.webp`)**: Dedicated slot for Manju's personal photograph.
3. **Vehicle Fleet (`/images/team/fleet-car.webp`, `fleet-van.webp`, `fleet-suv.webp`)**: Reserved for photos of Manju's actual air-conditioned Toyota fleet.
4. **Village Cooking Class (`hikkaduwa-village-cooking-class`)**: Awaiting authentic clay-pot village kitchen photos.
5. **Udawalawe Elephant Sanctuary**: Minneriya photos are kept distinct from Udawalawe to maintain regional accuracy.
6. **Other Destination Gallery Slots 2–3**: Tasteful placeholders with category badge ("Real Photo Slot Available").

## Archived Photos (`/_removed-photos/`)

- `destinations/kandy/gallery-2.*`: Duplicate copy of `hero.jpg` (Peradeniya Botanical Gardens) moved to `_removed-photos/destinations/kandy/`.
- Damaged/watermarked candidates from incoming (`mirissa-beach.jpg` corrupt EOF, `minneriya-elephants-second.jpg` watermarked, `hikkaduwa-beach.jpg` flat overcast, `sri-lanka-tea-plantation.jpg` letterboxed) excluded from live site.
