**Karaoke: MIDI to JSON and MIDI**:
[![Build Status](https://travis-ci.com/HackGT2019/midi-to-json.svg?branch=master)](https://travis-ci.com/HackGT2019/midi-to-json)

Takes a MIDI with a "vocal track" and outputs three files:
- A MIDI with just the vocal track (not really used for anything)
- A MIDI with all tracks but the vocal track (the background music for the karaoke)
- A JSON version of just the vocal track (all non-note events have been cleaned from the track) -- used for assessing karaoke score


**Two Converters in One**:
- Web app with gui (see index.html)
- Node js command (`node ./index` for help)

Note the **web app with the GUI** is officially supported
