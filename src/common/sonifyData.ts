import * as Tone from 'tone';
import * as d3 from 'd3';

type PlayingState = 'initial' | 'playing' | 'paused';

type ButtonLabel = 'Play' | 'Pause' | 'Resume' | 'Restart';

/**
 * Sets up a sonification of the given data and returns a function
 * for starting and stopping the sonification.
 * @param data - the population data to sonify
 * @returns a function that will start, stop, restart the sonification depending on
 * the current playing state
 */
export default function setupDataSonification(data: number[]) {
  let playingState: PlayingState = 'initial';

  const setPlayingState = (newState: PlayingState) => {
    playingState = newState;
  };

  const playPauseButton = document.getElementById(
    'play-pause-population-sonification'
  );

  const setPlayPauseButtonText = (text: ButtonLabel) => {
    if (playPauseButton) {
      playPauseButton.innerText = text;
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
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      resetPlayer();
    }
    index += 1;
  }, dataAsNotes);
  Tone.Transport.loop = false;
  sequence.loop = false;

  const resetPlayer = async () => {
    await sequence.start(0);
    await Tone.Transport.start();
    Tone.Transport.pause();
    setPlayPauseButtonText('Restart');
    setPlayingState('initial');
  };

  const startPlaying = async () => {
    await Tone.start();
    await sequence.start(0);
    await Tone.Transport.start();
    synth.volume.value = -10;
    setPlayPauseButtonText('Pause');
    setPlayingState('playing');
  };

  const resumePlaying = async () => {
    await sequence.start(0);
    await Tone.Transport.start();
    setPlayPauseButtonText('Pause');
    setPlayingState('playing');
  };

  const pausePlaying = () => {
    Tone.Transport.pause();
    setPlayPauseButtonText('Resume');
    setPlayingState('paused');
  };

  const handlePlayPauseButtonClicked = () => {
    if (playingState === 'initial') {
      startPlaying();
    } else if (playingState === 'playing') {
      pausePlaying();
    } else if (playingState === 'paused') {
      resumePlaying();
    }
  };

  return () => {
    handlePlayPauseButtonClicked();
  };
}
