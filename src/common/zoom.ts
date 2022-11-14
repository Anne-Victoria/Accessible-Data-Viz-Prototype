/* eslint-disable no-param-reassign */
interface ZoomState {
  isReset: boolean;
  zoomLevel: number;
}

/**
 * Measures the default width the root SVG element of the visualization
 * would have, if the visualization was in reset state. We need to measure this every time,
 * since the user might change the width of the browser, which results in the default width
 * having a different value.
 * @param visualizationElement - the SVG root element
 * @returns - the width as number (in pixels)
 */
function measureDefaultWidth(visualizationElement: HTMLElement): number {
  // Save the current size, so that it can be restored after

  const currentMaxWidth =
    window.getComputedStyle(visualizationElement).maxWidth;
  const currentMinWidth =
    window.getComputedStyle(visualizationElement).minWidth;

  const currentWidth = window.getComputedStyle(visualizationElement).width;
  const currentWidthInPx = parseInt(currentWidth.slice(0, -1), 10);

  if (Number.isNaN(currentWidthInPx)) {
    console.error('Failed to parse current width of visualization SVG root.');
    return 800;
  }

  // Reset the size and measure the default width
  // Note: Make sure these are in sync with the min and max widths set in CSS
  visualizationElement.style.minWidth = '700px';
  visualizationElement.style.maxWidth = '1200px';
  visualizationElement.style.width = '100%';

  const defaultSize = window.getComputedStyle(visualizationElement).width;
  const defaultSizeInPx = parseInt(defaultSize.slice(0, -1), 10);

  if (Number.isNaN(defaultSizeInPx)) {
    console.error('Failed to parse default width of visualization SVG root.');
    return 800;
  }

  // Restore the width and return the measured default size
  visualizationElement.style.minWidth = currentMinWidth;
  visualizationElement.style.maxWidth = currentMaxWidth;
  visualizationElement.style.width = currentWidth;

  return defaultSizeInPx;
}

function updateZoomLevel(
  zoomState: ZoomState,
  visualizationElement: HTMLElement
) {
  console.log(zoomState);

  if (zoomState.isReset) {
    visualizationElement.style.minWidth = '';
    visualizationElement.style.maxWidth = '';
    visualizationElement.style.width = '';
  } else {
    const defaultWidth = measureDefaultWidth(visualizationElement);
    visualizationElement.style.minWidth = 'initial';
    visualizationElement.style.maxWidth = 'initial';
    visualizationElement.style.width = `${
      zoomState.zoomLevel * defaultWidth
    }px`;
  }
}

function setUpZooming() {
  const zoomOutButton = document.getElementById('zoom-out');
  const zoomInButton = document.getElementById('zoom-in');
  const resetZoomButton = document.getElementById('reset-zoom');
  const visualizationElement = document.getElementById('vizRoot');

  const zoomStepSize = 0.25;

  let zoomState: ZoomState = {
    isReset: true,
    zoomLevel: 1,
  };

  if (
    !zoomOutButton ||
    !zoomInButton ||
    !resetZoomButton ||
    !visualizationElement
  ) {
    console.error(
      "Setting up zooming failed. Couldn't find all needed HTML elements."
    );
    return;
  }

  zoomOutButton.addEventListener('click', () => {
    const newZoomLevel = zoomState.zoomLevel - zoomStepSize;
    if (newZoomLevel < 0.5) return;

    zoomState = {
      isReset: false,
      zoomLevel: newZoomLevel,
    };

    updateZoomLevel(zoomState, visualizationElement);
  });

  zoomInButton.addEventListener('click', () => {
    const newZoomLevel = zoomState.zoomLevel + zoomStepSize;
    if (newZoomLevel > 4) return;

    zoomState = {
      isReset: false,
      zoomLevel: newZoomLevel,
    };

    updateZoomLevel(zoomState, visualizationElement);
  });

  resetZoomButton.addEventListener('click', () => {
    zoomState = {
      isReset: true,
      zoomLevel: 1,
    };

    updateZoomLevel(zoomState, visualizationElement);
  });
}

export default setUpZooming;
