import { parseArrayBuffer } from 'midi-json-parser';
import { encode } from 'json-midi-encoder';
import { saveAs } from 'file-saver';

const synth = require('synth-js');

const OUTPUT_PATH = './output/';
export async function loadMidi(midiBuffer, outputName, vocalTrack) {
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
        console.log(data);
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
    await writeOutputMidiAndConvert(OUTPUT_PATH, outputName + '_VOCALS', originalMidi);
    const vocalTrackPath = outputName + '.json';
    writeFile(vocalTrackPath, JSON.stringify(originalMidi));
}

function writeFile(path, buffer) {
    saveAs(new Blob([buffer]), path);
}

