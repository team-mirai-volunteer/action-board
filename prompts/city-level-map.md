# city-level-map
- /app/map/poster/[prefecture]
- our current map can't handle 10,000 points at once (prefecture level)
- so we want to break it down to city level
- we can get the city from the poster_boards db
- we want to bake the paths /map/poster/[prefecture]/[city]/page.tsx on build
    - we need to load from the db the unique values of cities in each prefecture
- the /[prefecture]/page.tsx will be (again) a smaller card of cities

# overall
1 Folder & file layout (App Router)
pgsql
Copy
Edit
app/
├─ [prefecture]/
│  ├─ [city]/
│  │  ├─ page.tsx          ← server component (exports generateStaticParams)
│  │  └─ MapClient.tsx     ← 'use client' Leaflet view
│  └─ layout.tsx           ← (optional) puts header/footer around every city page
└─ globals.css             ← include Leaflet CSS here
If you’re still on the Pages router, the ideas are identical—just put the logic in getStaticPaths and getStaticProps. From here on I’ll use the App-router names. 
nextjs.org
nextjs.org

2 Build-time path generation
ts
Copy
Edit
// app/[prefecture]/[city]/page.tsx
import { createServerClient } from '@supabase/ssr';
import MapClient from './MapClient';

// 1️⃣ Tell Next.js which /prefecture/city URLs to bake
export async function generateStaticParams() {
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!   // server-only key – safe here
  );

  // You only need the slugs, not the full row
  const { data, error } = await supabase
    .from('cities')                 // table: id | prefecture_slug | city_slug | lat | lng | …
    .select('prefecture_slug, city_slug');

  if (error) throw error;

  return data.map(({ prefecture_slug, city_slug }) => ({
    prefecture: prefecture_slug,
    city: city_slug,
  }));
}

// 2️⃣ Render the page shell (small, server component)
export default function CityPage({
  params,
}: {
  params: { prefecture: string; city: string };
}) {
  return (
    // Pass the slugs down, or fetch more data first if you want
    <MapClient prefecture={params.prefecture} city={params.city} />
  );
}

// 3️⃣ (optional) revalidate every 24 h so new cities appear without a rebuild
export const revalidate = 60 * 60 * 24;
Why put everything in the leaf segment?
generateStaticParams must sit in the segment that owns the final URL ([city]).
It can return all params—even those that belong to ancestors—so one function is enough for /[prefecture]/[city].

3 Client component with Leaflet
tsx
Copy
Edit
// app/[prefecture]/[city]/MapClient.tsx
'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

//  ⬅ dynamic import so Leaflet never runs on the server
const MapContainer = dynamic(
  () => import('react-leaflet').then(m => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), {
  ssr: false,
});

type Props = { prefecture: string; city: string };

export default function MapClient({ prefecture, city }: Props) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [center, setCenter] = useState<[number, number] | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('cities')
        .select('lat, lng')
        .eq('prefecture_slug', prefecture)
        .eq('city_slug', city)
        .single();
      if (data) setCenter([data.lat, data.lng]);
    })();
  }, [prefecture, city]);

  if (!center) return <p>Loading map…</p>;

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      {/* add markers, overlays, etc. */}
    </MapContainer>
  );
}
Because the page component stays a server component, none of Leaflet (or its hefty CSS) leaks into the Node render phase; only MapClient runs in the browser.

4 Build + seed pipeline
bash
Copy
Edit
# 0.  (CI) Reset DB and load reference data
supabase db reset --confirm
pnpm run seed:cities              # or psql < cities.sql

# 1. Next.js build pulls those rows and pre-renders every city page
next build
If you deploy on Vercel, put the two commands back-to-back in Build & Output Settings or in vercel.json:

jsonc
Copy
Edit
{
  "buildCommand": "supabase db reset --confirm && node scripts/seed.js && next build"
}

That’s the whole workflow: seed -> build-time generateStaticParams for /prefecture/city → server component wrapper → client-only Leaflet map. Once it’s wired, pages are fully static yet still interactive.
