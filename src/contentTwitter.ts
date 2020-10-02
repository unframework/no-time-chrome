console.log('Twitter content script');

// install the overlay
const mainNode = document.getElementsByTagName('main')[0]; // no need to wait, apparently?

const overlayNode = document.createElement('div');
overlayNode.style.position = 'absolute';
overlayNode.style.top = '0';
overlayNode.style.left = '0';
overlayNode.style.right = '0';
overlayNode.style.bottom = '0';
overlayNode.style.zIndex = '100'; // @todo is this enough?
overlayNode.style.background = '#ffffff';
mainNode.appendChild(overlayNode);

// location checker state
let currentLocation = '';
let currentCheckAttemptCount = 0;

// check if location has changed for the next few moments, with linear back-off
function checkLocationChange() {
  currentCheckAttemptCount += 1;
  const checkAttemptId = currentCheckAttemptCount;

  async function waitAndCheck(attemptCount: number): Promise<boolean> {
    const timeoutMs = attemptCount * 20; // linear back-off for simplicity
    await new Promise((resolve) => setTimeout(resolve, timeoutMs));

    // bail out if a newer checker was launched
    if (currentCheckAttemptCount !== checkAttemptId) {
      return false;
    }

    // if there was a change, report it
    if (document.location.href !== currentLocation) {
      currentLocation = document.location.href;
      return true;
    }

    // bail out if we have been trying for too long
    if (attemptCount > 10) {
      return false;
    }

    // otherwise, asynchronously recurse
    return waitAndCheck(attemptCount + 1);
  }

  // always launch a fresh check sequence
  waitAndCheck(0).then((locationChanged) => {
    if (locationChanged) {
      console.log('new location detected', currentLocation, checkAttemptId);
    }
  });
}

// since we cannot detect pushState, need to intercept link clicks
window.addEventListener(
  'click',
  (event) => {
    checkLocationChange();
  },
  {
    capture: true // intercept focus events
  }
);

// also listen for back-button/etc
window.addEventListener('popstate', (event) => {
  checkLocationChange();
});

// initial check
checkLocationChange();

export default {}; // dummy module syntax
