import csv
import json
import itertools
import numpy as np

with open('app/data/citibike/stations_by_group.json') as groups_file:
  groups = json.loads(groups_file.read())

  group_index_for = dict()
  for index, group in enumerate(groups):
    for station in group['stations']:
      group_index_for[station['id']] = index

  with open('app/data/citibike/2014-08 - Citi Bike trip data.csv') as trips_input_file:
    trips_histogram = np.zeros((len(groups), len(groups)))

    trips_iter = itertools.islice(csv.reader(trips_input_file), None)
    next(trips_iter)
    for row in trips_iter:
      start_station_id = int(row[3])
      start_group_id = group_index_for[start_station_id]
      end_station_id = int(row[7])
      end_group_id = group_index_for[end_station_id]
      trips_histogram[start_group_id][end_group_id] += 1

    trips_histogram_json = json.dumps(trips_histogram.tolist(), indent=2)

    with open('app/data/citibike/trips_histogram.json', 'w') as trips_output_file:
      trips_output_file.write(trips_histogram_json)
      print trips_histogram_json
