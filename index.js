const fs = require('fs');
const { Midi } = require('@tonejs/midi');
const OUTPUT_PATH = './output/';

loadMidi('./songs/a_song.mid', 'a_song', ['voice']);

function loadMidi(pathToMidi, outputName, vocalTrackNames) {
    const midiData = fs.readFileSync(pathToMidi);
    const midi = new Midi(midiData);
    const vocalTracks = [];
    midi.tracks = midi.tracks.filter((track) => {
        let keep;
        if (vocalTrackNames.some((trackName) => trackName.toLowerCase() === track.name.toLowerCase())) {
            keep = false;
            vocalTracks.push(track);
        } else {
            keep = true;
        }
        return keep;
    });
    writeOutputMidi(OUTPUT_PATH, outputName + '_NO_VOCALS', midi);
    processVocals(vocalTracks[0], midi, outputName); // process the vocals
}

function writeOutputMidi(filePath, name, midi) {
    fs.writeFileSync(filePath + name + '.mid', new Buffer(midi.toArray()));
}

function processVocals(vocalTrack, originalMidi, outputName) {
    originalMidi.tracks = [vocalTrack]; // use original midi because it has correct timing
    writeOutputMidi(OUTPUT_PATH, outputName + '_VOCALS', originalMidi);
    fs.writeFileSync(OUTPUT_PATH + outputName + '.json', JSON.stringify(originalMidi));
}
