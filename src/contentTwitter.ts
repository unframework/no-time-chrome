console.log('Twitter content script');

const overlayNode = document.createElement('div');
overlayNode.style.position = 'absolute';
overlayNode.style.top = '0';
overlayNode.style.left = '0';
overlayNode.style.right = '0';
overlayNode.style.bottom = '0';
overlayNode.style.zIndex = '100'; // @todo is this enough?
overlayNode.style.background = '#ffffff';
overlayNode.style.opacity = '1';

// install the overlay when main node becomes available
async function waitAndInstallOverlay(attemptCount: number): Promise<void> {
  const timeoutMs = Math.min(500, attemptCount * 50); // linear back-off for simplicity
  await new Promise((resolve) => setTimeout(resolve, timeoutMs));

  const mainNode = document.getElementsByTagName('main')[0];

  // if not available yet, try again
  if (!mainNode) {
    return waitAndInstallOverlay(attemptCount + 1);
  }

  mainNode.appendChild(overlayNode);
}

waitAndInstallOverlay(0);

// location checker state
let currentLocation = '';
let currentCheckAttemptCount = 0;

// check if location has changed for the next few moments, with linear back-off
function checkLocationChange() {
  currentCheckAttemptCount += 1;
  const checkAttemptId = currentCheckAttemptCount;

  async function waitAndCheck(attemptCount: number): Promise<string | null> {
    const timeoutMs = attemptCount * 20; // linear back-off for simplicity
    await new Promise((resolve) => setTimeout(resolve, timeoutMs));

    // bail out if a newer checker was launched
    if (currentCheckAttemptCount !== checkAttemptId) {
      return null;
    }

    // if there was a change, report the new locaiton
    if (document.location.href !== currentLocation) {
      currentLocation = document.location.href; // immediately mark this down in state
      return currentLocation;
    }

    // bail out if we have been trying for too long
    if (attemptCount > 10) {
      return null;
    }

    // otherwise, asynchronously recurse
    return waitAndCheck(attemptCount + 1);
  }

  // always launch a fresh check sequence
  waitAndCheck(0).then((newLocation) => {
    if (!newLocation) {
      return;
    }

    const pathMatch = /^[^/]*\/\/[^/]*(\/.*)/.exec(newLocation);
    const path = pathMatch && pathMatch[1];

    if (!path) {
      return;
    }

    if (path.startsWith('/home') || path.startsWith('/explore')) {
      overlayNode.style.opacity = '1';
      overlayNode.style.pointerEvents = 'auto'; // clicks are blocked
      overlayNode.style.transition = 'none'; // immediate effect
    } else {
      overlayNode.style.opacity = '0';
      overlayNode.style.pointerEvents = 'none'; // clicks fall through
      overlayNode.style.transition = 'opacity 0.2s ease-out'; // fade out
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
