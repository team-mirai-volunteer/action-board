# poster map
we want to add a poster map
- ./app/mas/poster/page.tsx
- ./app/map/poster/[prefecture]/page.tsx

## idea
the basic idea of the poster map is that we have
- boards: [prefecture, number, lat, lon, name, status]
which represent billing boards. people will put posters on this billing board for the upcoming election.

## basic functionality
- a leaflet map is shown
- from the db, the [lan, lon] of the board will be read
- it will be put on the map as pins
- people will **touch/push** the pins, and change the status

### status
- the basic status is [not_yet, posted]
    - logged in users can change, and that change will be recorded
- however, as these are physical boards, we will have other status
    - checked: other people can check that the poster was actually there
    - damaged: the poster is damaged
    - error: the poster board is not there (wrong lat/lon in db)
    - other: other

### what's left
- RLS so anon can't do anything
- add tests
