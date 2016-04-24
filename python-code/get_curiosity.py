'''
used from here: https://github.com/hrwgc/planets/blob/gh-pages/data/mars_curiosity_tracks.py
'''

import json
from xml.dom import minidom
import urllib2
import xmltodict
import simplejson
try:
    from simplejson import JSONEncoderForHTML
except:
    from simplejson.encoder import JSONEncoderForHTML

locs = 'http://mars.jpl.nasa.gov/msl-raw-images/locations.xml'

data = urllib2.urlopen(locs).read()
xmldoc = minidom.parseString(data)
covs = xmldoc.getElementsByTagName('location')

featureCollection = []

for cov in reversed(covs):
	with open('curiosity_location.txt', 'w') as outfile:
		json.dump(xmltodict.parse(cov.toxml()).get('location'), outfile, sort_keys=True, indent=4, ensure_ascii=False)
	break


