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
    .range([200, 1000]);

  return async () => {
    const synth = new Tone.Synth().toDestination();
    await Tone.start();
    const now = Tone.now();
    data.forEach((datapoint, index) => {
      console.log(toneScale(datapoint));
      synth.triggerAttackRelease(
        toneScale(datapoint),
        '32n',
        now + 0.25 * index
      );
    });
  };
}
