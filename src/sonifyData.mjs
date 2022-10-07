/* global d3 */
import * as Tone from 'tone';

export default function sonifiyData(data) {
  const largestValue = Math.max(...data);
  const smallestValue = Math.min(...data);

  const toneScale = d3
    .scaleLinear()
    .domain([smallestValue, largestValue])
    .range([200, 1000]);

  const sonifiedSequence = data.map((datapoint) => toneScale(datapoint));

  const synth = new Tone.Synth().toDestination();
  const now = Tone.now();
  const sequence = new Tone.Sequence((time, note) => {
    synth.triggerAttackRelease(note, 0.03, time);
  }, sonifiedSequence);
  Tone.Transport.loop = false;
  sequence.loop = false;

  const play = async () => {
    await Tone.start();
    await sequence.start(0);
    await Tone.Transport.start();
  };

  const stop = () => {
    console.log(sequence);
    console.log(sequence.progress);
    Tone.Transport.pause();
  };

  return [play, stop];
}
