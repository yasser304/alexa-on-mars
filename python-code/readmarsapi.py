import requests
import json

url = "http://marsweather.ingenology.com/v1/archive/"
weather_data_list = []

while url!=None:

	response = requests.get(url)
	jsondata = response.json()
	elems = jsondata[u'results']

	for elem in elems:
		weather_data_list.append(elem)

	url=jsondata[u'next']

with open('jsonfile.txt', 'w') as outfile:
	json.dump(weather_data_list, outfile, sort_keys=True, indent=4, ensure_ascii=False)


