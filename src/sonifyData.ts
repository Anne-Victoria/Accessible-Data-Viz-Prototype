/* global d3 */
import * as Tone from 'tone';
import * as d3 from 'd3';

type stateChangeAction = 'playPauseButtonPressed' | 'sonificationEnded';

export default function sonifiyData(data: number[]) {
  let playingState = 'initial';
  const playPauseButton = document.getElementById(
    'play-pause-population-sonification'
  );

  const setPlayPauseButtonText = (text: string) => {
    if (playPauseButton) {
      playPauseButton.innerText = text;
    }
  };

  let dispatchStateChange = (action: stateChangeAction) => {
    console.log(playingState, action);
    if (action === 'playPauseButtonPressed' && playingState === 'initial') {
      setPlayPauseButtonText('Pause');
      playingState = 'playing';
      startPlaying();
    } else if (
      action === 'playPauseButtonPressed' &&
      playingState === 'playing'
    ) {
      setPlayPauseButtonText('Resume');
      playingState = 'paused';
      pausePlaying();
    } else if (
      action === 'playPauseButtonPressed' &&
      playingState === 'paused'
    ) {
      setPlayPauseButtonText('Pause');
      playingState = 'playing';
      resumePlaying();
    } else if (action === 'sonificationEnded') {
      setPlayPauseButtonText('Restart');
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
  let index = 0;
  const sequence = new Tone.Sequence((time, note) => {
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
    synth.volume.value = -10;
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
