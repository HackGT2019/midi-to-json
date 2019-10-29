import { parseArrayBuffer } from 'midi-json-parser';
import { encode } from 'json-midi-encoder';
import { saveAs } from 'file-saver';

const synth = require('synth-js');
const OUTPUT_PATH = './output/';

async function handleFileSelect(evt) {
    var file = evt.target.files[0]; // FileList object
    const output = await file.arrayBuffer();
    const outputName = file.name.substring(0, file.name.lastIndexOf('.'));
    loadMidi(output, outputName, "voice");
}

document.getElementById('file').addEventListener('change', handleFileSelect, false);

async function loadMidi(midiBuffer, outputName, vocalTrack) {
    const midi = await parseArrayBuffer(midiBuffer);
    const vocalTracks = [];
    midi.tracks = midi.tracks.filter((track) => {
        let keep;
        const trackName = getTrackName(track);
        if (trackName != null && trackName.toLowerCase() === vocalTrack.toLowerCase()) {
            keep = false;
            vocalTracks.push(track);
        } else {
            keep = true;
        }
        return keep;
    });
    if (vocalTracks.length === 0 && midi.tracks.length >= 2) {
        vocalTracks.push(midi.tracks.splice(midi.tracks.length - 2, 1)[0]); // assume the last track is the vocal track
    }
    writeOutputMidiAndConvert(OUTPUT_PATH, outputName + '_NO_VOCALS', midi);
    if (vocalTracks.length > 0) {
        processVocals(vocalTracks[0], midi, outputName); // process the vocals
    }
    console.log('Completed');
}

function getTrackName(track) {
    const MAX_ATTEMPT = 100;
    const POSSIBLE_KEYS = ['name', 'trackName'];
    let name = null;
    for (let counter = 0; counter < MAX_ATTEMPT && counter < track.length; counter++) {
        const data = track[counter];
        for (let keyCounter = 0; keyCounter < POSSIBLE_KEYS.length; keyCounter++) {
            const key = POSSIBLE_KEYS[keyCounter];
            if (data[key] != null) {
                name = data[key];
                break;
            }

        }
        if (name != null) {
            break;
        }

    }
    return name;
}

async function writeOutputMidiAndConvert(filePath, name, midi) {
    // eslint-disable-next-line no-undef
    writeFile(name + '.mid', (await encode(midi)));
}

async function processVocals(vocalTrack, originalMidi, outputName) {
    originalMidi.tracks = [vocalTrack]; // use original midi because it has correct timing

    try {
        await writeOutputMidiAndConvert(OUTPUT_PATH, outputName + '_VOCALS', originalMidi);
    } catch (error) {
        console.log('Failed to write vocal track to midi');
        console.log(error);
    }
    // filter out the non vocal notes from the midi (after the non-vocal has already been saved because otherwise it would mess-up re-encoding it)
    originalMidi.tracks = [filterOutNonNotes(vocalTrack)];
    console.log(originalMidi.tracks);

    const vocalTrackPath = outputName + '.json';
    writeFile(vocalTrackPath, JSON.stringify(originalMidi));
}

function filterOutNonNotes(vocalTrack) {
    return vocalTrack.filter((event) => {
        return event.noteOn != null || event.noteOff != null;
    });
}

function writeFile(path, buffer) {
    saveAs(new Blob([buffer]), path);
}

