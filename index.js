const fs = require('fs');
const { Midi } = require('@tonejs/midi');
const synth = require('synth-js');

const argsv = require('yargs')
    .alias('p', 'path')
    .require('p', 'path required')
    .describe('p', 'path to the midi file')
    .string('p')
    .alias('n', 'name')
    .require('n', 'name of output required')
    .describe('n', 'name of output')
    .string('n')
    .alias('v', 'vocal-track')
    .require('v', 'vocal track name required')
    .describe('v', 'EXACT name of vocal track in the midi')
    .string('v')
    .argv;


const OUTPUT_PATH = './output/';

loadMidi(argsv.p, argsv.n, argsv.v);

function loadMidi(pathToMidi, outputName, vocalTrack) {
    console.log(`Loading from ${pathToMidi}`);
    const midiData = fs.readFileSync(pathToMidi);
    const midi = new Midi(midiData);
    const vocalTracks = [];
    midi.tracks = midi.tracks.filter((track) => {
        let keep;
        if (vocalTrack.toLowerCase() === track.name.toLowerCase()) {
            keep = false;
            vocalTracks.push(track);
        } else {
            keep = true;
        }
        return keep;
    });
    writeOutputMidiAndConvert(OUTPUT_PATH, outputName + '_NO_VOCALS', midi);
    processVocals(vocalTracks[0], midi, outputName); // process the vocals
    console.log('Completed');
}

function writeOutputMidiAndConvert(filePath, name, midi) {
    const fullPath = filePath + name + '.mid';
    // eslint-disable-next-line no-undef
    fs.writeFileSync(fullPath, new Buffer.from(midi.toArray()));
    console.log(`Outputting midi to ${fullPath}`);
    midiToWav(fullPath, filePath, name);

}
function midiToWav(pathToMidi, filePath, name) {
    // const buffer = fs.readFileSync(pathToMidi);
    // const wavBuffer = synth.midiToWav(buffer).toBuffer();
    // const fullPath = filePath + name + '.wav';
    // fs.writeFileSync(fullPath, wavBuffer, {encoding: 'binary'});
    // console.log(`Outputting wav to ${fullPath}`);
}

function processVocals(vocalTrack, originalMidi, outputName) {
    originalMidi.tracks = [vocalTrack]; // use original midi because it has correct timing
    writeOutputMidiAndConvert(OUTPUT_PATH, outputName + '_VOCALS', originalMidi);
    const vocalTrackPath = OUTPUT_PATH + outputName + '.json';
    fs.writeFileSync(vocalTrackPath, JSON.stringify(originalMidi));
    console.log(`Writing vocal track to ${vocalTrackPath}`);

}
