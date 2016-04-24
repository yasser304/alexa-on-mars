from lxml import html
import requests
from bs4 import BeautifulSoup
import pickle

page = requests.get('http://curiosityrover.com/tracking/drivelog.html')
tree = html.fromstring(page.content)

even_item_list = tree.xpath("//tr[@class='evenitem']")
odd_item_list = tree.xpath("//tr[@class='odditem']")
#nearest even 
total_obs = min(len(even_item_list), len(odd_item_list)) & ~1

midi_dict = {}

#http://stackoverflow.com/a/2807496
#as 0th index is null
for index in range(1,total_obs+1):
	evenitem = [elem.text for elem in tree.xpath("//tr[@class='evenitem'][position() = " + str(index) + "]/td")]
	midi_dict[evenitem[3].split()[0]] = [evenitem[1], evenitem[2], evenitem[7]]
	odditem = [elem.text for elem in tree.xpath("//tr[@class='odditem'][position() = " + str(index) + "]/td")]
	midi_dict[odditem[3].split()[0]] = [odditem[1], odditem[2], odditem[7]]

with open('midi_dict.pickle', 'wb') as handle:
  pickle.dump(midi_dict, handle)

#http://stackoverflow.com/a/18231804
#soup = BeautifulSoup("<tr><td>1<td><td>20<td>5%</td></td></td></td></tr>")
#tr = soup.find("tr")
