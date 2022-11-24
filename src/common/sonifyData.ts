import * as Tone from 'tone';
import * as d3 from 'd3';

type PlayingState = 'initial' | 'playing' | 'paused';

type ButtonLabel = 'Play' | 'Pause' | 'Resume' | 'Restart';

/**
 * Creates the sequence that determines when which note will be played
 *
 * @param data - the data to create the sequence from
 * @param secondDataSeries - an additional series of data points
 * @param toneScale - the scale for mapping data points to notes
 * @param resetPlayer - function for resetting the player at the end of the sequence
 * @returns sequence - the created sequence
 */
const createSequence = (
  data: number[],
  secondDataSeries: number[] | null,
  toneScale: d3.ScaleLinear<number, number, never>,
  resetPlayer: () => Promise<void>
): Tone.Sequence<any> => {
  const dataAsNotes = data.map((datapoint) => toneScale(datapoint));
  const synth = new Tone.Synth().toDestination();

  // synth.volume.value = -10;
  let secondDataAsNotes: number[];
  if (secondDataSeries) {
    secondDataAsNotes = secondDataSeries.map((datapoint) =>
      toneScale(datapoint)
    );
  }
  const durationOfOneUnit = secondDataSeries ? 1 : 0.5;

  let index = 0;
  const sequence = new Tone.Sequence(
    (time, note) => {
      synth.triggerAttackRelease(note, 0.1, time);
      if (secondDataSeries) {
        synth.triggerAttackRelease(secondDataAsNotes[index], 0.1, time + 0.2);
      }
      if (index === dataAsNotes.length - 1) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        resetPlayer();
      }
      index += 1;
    },
    dataAsNotes,
    durationOfOneUnit
  );

  Tone.Transport.loop = false;
  sequence.loop = false;

  return sequence;
};

/**
 * Sets up a sonification of the given data and returns a function
 * for starting and stopping the sonification.
 *
 * @param data - the data to sonify
 * @param secondDataSeries - an additional series of data points
 * @param buttonId - the id of the play/pause button
 * @param toneScale - the scale for mapping data points to notes
 * @returns a function that will start, stop, restart the sonification depending on
 * the current playing state
 */
export default function setupDataSonification(
  data: number[],
  secondDataSeries: number[] | null,
  buttonId: string,
  toneScale: d3.ScaleLinear<number, number, never>
): () => void {
  let playingState: PlayingState = 'initial';
  const playPauseButton = document.getElementById(buttonId);
  let sequence: Tone.Sequence<any> = new Tone.Sequence();

  /**
   * Changes the playing state
   *
   * @param newState - the state to change to
   */
  const setPlayingState = (newState: PlayingState): void => {
    playingState = newState;
  };

  /**
   * Change the text of the button that controls the playing state
   *
   * @param text - the new text for the button
   */
  const setPlayPauseButtonText = (text: ButtonLabel): void => {
    if (playPauseButton) {
      playPauseButton.innerText = text;
    }
  };

  /**
   * Resets the player to the initial state from before anything started playing
   */
  const resetPlayer = async (): Promise<void> => {
    sequence.dispose();
    Tone.Transport.cancel(0);
    Tone.Transport.seconds = 0;
    setPlayPauseButtonText('Restart');
    setPlayingState('initial');
  };

  sequence = createSequence(data, secondDataSeries, toneScale, resetPlayer);
  /**
   * Start playing the sonification (from the start)
   */
  const startPlaying = async (): Promise<void> => {
    await Tone.start();
    sequence.dispose();
    Tone.Transport.cancel(0);
    sequence = createSequence(data, secondDataSeries, toneScale, resetPlayer);
    sequence.start(0);
    Tone.Transport.seconds = 0;
    Tone.Transport.start();
    setPlayPauseButtonText('Pause');
    setPlayingState('playing');
  };

  /**
   * Resume playing from wherever the sonification was stopped
   */
  const resumePlaying = async (): Promise<void> => {
    sequence.start(0);
    Tone.Transport.start();
    setPlayPauseButtonText('Pause');
    setPlayingState('playing');
  };

  /**
   * Pause the sonification
   */
  const pausePlaying = (): void => {
    Tone.Transport.pause();
    setPlayPauseButtonText('Resume');
    setPlayingState('paused');
  };

  /**
   * Call the needed action when the play/pause/resume button is clicked,
   * depending on the current playing state
   */
  const handlePlayPauseButtonClicked = (): void => {
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
