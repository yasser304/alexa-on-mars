from miditime.miditime import MIDITime
import pickle
import json
import pprint
import datetime
import sys

pp = pprint.PrettyPrinter(indent=4)
sound_of_curiosity = None

def aggregate_data():
	json_list = []
	running_minimum = sys.float_info.max
	running_maximum = sys.float_info.min

	with open('midi_dict.pickle', 'rb') as handle:
  		driver_log = pickle.load(handle)

  	with open('jsonfile.txt') as json_data:
  		json_vals = json.load(json_data)

  	for record in reversed(json_vals):
  		#pp.pprint(record)
  		sol = str(record[u'sol'])
  		terrestrial_date = str(record[u'terrestrial_date'])
  		if sol in driver_log:
  			midi_dict = {}
  			midi_dict['terrestrial_date'] = terrestrial_date
  			midi_dict['duration'] = int(driver_log[sol][1].split(':')[0])
  			midi_dict['elevation'] = float(driver_log[sol][2])

  			#categorize elevation so that the sonification is not too high-picthed towards the end

  			running_minimum = min(running_minimum, midi_dict['elevation'])
  			running_maximum = max(running_maximum, midi_dict['elevation'])

  			json_list.append(midi_dict)

  	return json.dumps(json_list), running_minimum, running_maximum 

def mag_to_pitch_map(magnitude, minimum, maximum):
	scale_pct = sound_of_curiosity.linear_scale_pct(minimum, maximum, magnitude)
	c_major = ['C', 'D', 'E', 'F', 'G']
	note = sound_of_curiosity.scale_to_note(scale_pct, c_major)
	midi_pitch = sound_of_curiosity.note_to_midi_pitch(note)
	return midi_pitch

def create_notes(timed_data, start_time, minimum, maximum):
	note_list = []

	for d in timed_data:
		note_list.append([
        	d['beat'] - start_time,
        	mag_to_pitch_map(d['magnitude'], minimum, maximum),
        	50,  # attack
        	3  # duration, in beats
    	])
	
	print len(note_list)

	return note_list[0:140]

def data_sonification(time_series_json, curiosity_midi):	
	curiosity_data = json.loads(time_series_json)
	curiosity_data_epoched = [{'days_since_epoch': curiosity_midi.days_since_epoch(datetime.datetime.strptime(elem['terrestrial_date'], '%Y-%m-%d')), 'magnitude': elem['elevation']} for elem in curiosity_data]
	curiosity_data_timed = [{'beat': curiosity_midi.beat(elem['days_since_epoch']), 'magnitude': elem['magnitude']} for elem in curiosity_data_epoched]
	start_time = curiosity_data_timed[100]['beat']

	return curiosity_data_timed, start_time

def create_midi(bpm, output, seconds_per_year, base_octave, num_of_octaves):
	return MIDITime(120,'sound_of_curiosity.mid', seconds_per_year, base_octave, num_of_octaves) 

def main():
	global sound_of_curiosity
	sound_of_curiosity = create_midi(120, #bpm
							 	'sound_of_curiosity.mid', #output midi file
							 	10, #10 seconds/year
							 	4, #base octave
							 	8) #num of octaves

	time_series_json, minimum, maximum = aggregate_data()
	#pp.pprint(time_series_data)
	timed_data, start_time = data_sonification(time_series_json, sound_of_curiosity)
	note_list = create_notes(timed_data, start_time, minimum, maximum)

	sound_of_curiosity.add_track(note_list)
	sound_of_curiosity.save_midi()

if __name__ == "__main__":
	main()