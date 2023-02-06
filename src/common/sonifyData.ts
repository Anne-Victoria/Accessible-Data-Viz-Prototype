import * as Tone from 'tone';
import * as d3 from 'd3';

type PlayingState = 'initial' | 'playing' | 'paused';

type ButtonState = 'play' | 'pause' | 'resume' | 'restart';

const buttonContents = {
  play: `
    <div class="icon-button-content">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 384 512"
        class="button-icon"
      >
        <!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
        <path
          d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"
        />
      </svg>
      Abspielen
    </div>
  `,
  pause: `
    <div class="icon-button-content">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 320 512"
        class="button-icon"
      >
        <!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
        <path
          d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"
        />
      </svg>
      Pausieren
    </div>

  `,
  resume: `
    <div class="icon-button-content">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 384 512"
        class="button-icon"
      >
        <!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
        <path
          d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"
        />
      </svg>
      Fortsetzen
    </div>
  `,
  restart: `
    <div class="icon-button-content">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        class="button-icon"
      >
        <!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
        <path
          d="M125.7 160H176c17.7 0 32 14.3 32 32s-14.3 32-32 32H48c-17.7 0-32-14.3-32-32V64c0-17.7 14.3-32 32-32s32 14.3 32 32v51.2L97.6 97.6c87.5-87.5 229.3-87.5 316.8 0s87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3s-163.8-62.5-226.3 0L125.7 160z"
        />
      </svg>
      Erneut abspielen
    </div>
  `,
};

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
  const setPlayPauseButtonContent = (text: ButtonState): void => {
    if (playPauseButton) {
      playPauseButton.innerHTML = buttonContents[text];
    }
  };

  /**
   * Resets the player to the initial state from before anything started playing
   */
  const resetPlayer = async (): Promise<void> => {
    sequence.dispose();
    Tone.Transport.cancel(0);
    Tone.Transport.seconds = 0;
    setPlayPauseButtonContent('restart');
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
    setPlayPauseButtonContent('pause');
    setPlayingState('playing');
  };

  /**
   * Resume playing from wherever the sonification was stopped
   */
  const resumePlaying = async (): Promise<void> => {
    sequence.start(0);
    Tone.Transport.start();
    setPlayPauseButtonContent('pause');
    setPlayingState('playing');
  };

  /**
   * Pause the sonification
   */
  const pausePlaying = (): void => {
    Tone.Transport.pause();
    setPlayPauseButtonContent('resume');
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

  // Make sure any previously running sound is cleared. This is important for when the user switches
  // between data series.
  resetPlayer();
  setPlayPauseButtonContent('play');

  return () => {
    handlePlayPauseButtonClicked();
  };
}
