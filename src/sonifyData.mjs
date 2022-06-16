/* global d3 */
import * as Tone from 'tone';

export default function sonifiyData(data) {
  console.log(data);
  const largestValue = Math.max(...data);
  const smallestValue = Math.min(...data);
  console.log(smallestValue, largestValue);

  const toneScale = d3
    .scaleLinear()
    .domain([smallestValue, largestValue])
    .range([400, 800]);

  // data.forEach((datapoint, index) => {
  //   console.log(toneScale(datapoint));
  //   synth.triggerAttackRelease(toneScale(datapoint), '16n', now + 0.5 * index);
  // });

  return async () => {
    const synth = new Tone.Synth().toDestination();
    await Tone.start();
    const now = Tone.now();
    data.forEach((datapoint, index) => {
      console.log(toneScale(datapoint));
      synth.triggerAttackRelease(
        toneScale(datapoint),
        '16n',
        now + 0.5 * index
      );
    });
  };

  //play a middle 'C' for the duration of an 8th note
  // synth.triggerAttackRelease('C4', '8n');
}
