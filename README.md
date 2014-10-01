CitiBike Map
===========

Simple visualization of what trips people take on Citibikes.

## Development

### Generating/processing data

All processed data exists in the repo. To regenerate the data

* Install numpy
* Download the August 2014 trip data from [the CitiBike website](http://www.citibikenyc.com/system-data) and put the unzipped csv in the app/data/citibike folder
* Run the following scripts:

```bash
node scripts/find_neighborhoods.js
node scripts/group_neighborhoods.js
python scripts/tally_rides.py
```

### Run local server

* `gulp`


