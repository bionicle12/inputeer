// background.js - MV3 service worker
// Receives code from the content script and evaluates it in the page's main world using Chrome Debugger API.

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || msg.type !== 'INPUTEER_EVAL') return; // ignore other messages

  const tabId = sender.tab && sender.tab.id;
  if (!tabId) {
    sendResponse({ ok: false, error: 'No tab context' });
    return true;
  }

  const target = { tabId };

  // Attach debugger (requires user permission per tab; Chrome shows infobar)
  chrome.debugger.attach(target, '1.3', () => {
    if (chrome.runtime.lastError) {
      sendResponse({ ok: false, error: chrome.runtime.lastError.message });
      return;
    }

    const expression = msg.code;

    // Evaluate in the page context
    chrome.debugger.sendCommand(target, 'Runtime.enable', {}, () => {
      if (chrome.runtime.lastError) {
        cleanup('Runtime.enable failed: ' + chrome.runtime.lastError.message);
        return;
      }

      chrome.debugger.sendCommand(
        target,
        'Runtime.evaluate',
        {
          expression,
          contextId: undefined,
          includeCommandLineAPI: true,
          awaitPromise: true,
          returnByValue: true
        },
        (result) => {
          if (chrome.runtime.lastError) {
            cleanup('Evaluate failed: ' + chrome.runtime.lastError.message);
            return;
          }

          if (result && result.exceptionDetails) {
            const message = (result.exceptionDetails && result.exceptionDetails.text) || 'Exception';
            cleanup(message);
            return;
          }

          const value = result && result.result ? result.result.value : undefined;
          cleanup(null, value);
        }
      );
    });
  });

  function cleanup(error, value) {
    chrome.debugger.detach(target, () => {
      // ignore detach errors
      if (error) sendResponse({ ok: false, error });
      else sendResponse({ ok: true, result: value });
    });
  }

  return true; // keep message channel open for async sendResponse
});

