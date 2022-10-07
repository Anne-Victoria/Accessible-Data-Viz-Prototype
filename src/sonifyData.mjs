/* global d3 */
import * as Tone from 'tone';

export default function sonifiyData(data) {
  let playingState = 'initial';
  const playPauseButton = document.getElementById(
    'play-pause-population-sonification'
  );

  let dispatchStateChange = (action) => {
    console.log(playingState, action);
    if (action === 'playPauseButtonPressed' && playingState === 'initial') {
      playPauseButton.innerText = 'Pause';
      playingState = 'playing';
      startPlaying();
    } else if (
      action === 'playPauseButtonPressed' &&
      playingState === 'playing'
    ) {
      playPauseButton.innerText = 'Resume';
      playingState = 'paused';
      pausePlaying();
    } else if (
      action === 'playPauseButtonPressed' &&
      playingState === 'paused'
    ) {
      playPauseButton.innerText = 'Pause';
      playingState = 'playing';
      resumePlaying();
    } else if (action === 'sonificationEnded') {
      playPauseButton.innerText = 'Restart';
      playingState = 'initial';
      resetPlayer();
      console.log('resetting to initial');
    }
  };

  const largestValue = Math.max(...data);
  const smallestValue = Math.min(...data);

  const toneScale = d3
    .scaleLinear()
    .domain([smallestValue, largestValue])
    .range([200, 1000]);

  const dataAsNotes = data.map((datapoint) => toneScale(datapoint));

  const synth = new Tone.Synth().toDestination();
  const now = Tone.now();
  let index = 0;
  const sequence = new Tone.Sequence((time, note) => {
    console.log(index);
    synth.triggerAttackRelease(note, 0.03, time);
    if (index === dataAsNotes.length - 1) {
      dispatchStateChange('sonificationEnded');
    }
    index++;
  }, dataAsNotes);
  Tone.Transport.loop = false;
  sequence.loop = false;

  const startPlaying = async () => {
    await Tone.start();
    await sequence.start(0);
    await Tone.Transport.start();
    synth.volume.value = -20;
  };

  const resumePlaying = async () => {
    await sequence.start(0);
    await Tone.Transport.start();
  };

  const pausePlaying = () => {
    Tone.Transport.pause();
  };

  const resetPlayer = async () => {
    await sequence.start(0);
    await Tone.Transport.start();
    Tone.Transport.pause();
  };

  return () => {
    dispatchStateChange('playPauseButtonPressed');
  };
}
