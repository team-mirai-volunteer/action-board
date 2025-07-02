# we need an automated data loader
raw data is in “~/Google\ Drive/Shared\ drives/チームみらい\(外部共有\)/ポスター・ポスティ ングロジ/ポスター・ポスティング作業用/ポスター/ポスター掲示場CSV化/自治体”. never write to this. copy only. 

we made a raw_data and broken_data directory along poster_data, gitignored for now

we want a script to auto load data. 

it should 
we add poster_data/temp folder
we look into the 自治体 folder for raw data

for each folder under pref/city
within raw, we look into each folder and look for a xxx_normalized.csv file
    - basically we looking pref/city and not further than that
if there are multiple, pause and ask for input which to select. usually it’s the shortest one, which is concat of the other ones (think 横浜市青葉区, there are many 区 but the correct one is the concerted 横浜市_normalized.csv)

try
	we put that folder within the poster_data/temp
	we run nom poster:load-csv
  if it succeeds :
		put the csv in the correct prefecture (poster_data/<prefecture>)
	if not
		put the csv in broken (broken_poster_data/<prefecture>


this let’s us automate to get the non-broken data into the code base

it also let’s us automate for further changes
