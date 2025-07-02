# city-level-map
- /app/map/poster/[prefecture]
- our current map can't handle 10,000 points at once (prefecture level)
- so we want to break it down to city level
- we can get the city from the poster_boards db
- we want to bake the paths /map/poster/[prefecture]/[city]/page.tsx on build
    - we need to load from the db the unique values of cities in each prefecture
- the /[prefecture]/page.tsx will be (again) a smaller card of cities
