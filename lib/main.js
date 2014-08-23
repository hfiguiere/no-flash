var self = require("sdk/self");
var { viewFor } = require("sdk/view/core");
var tabs = require("sdk/tabs");
var browserWindows = require("sdk/windows").browserWindows;

// attach to new windows when created.
browserWindows.on("open", attachToWindow);

// attach to existing windows.
for (let browserWindow of browserWindows) {
// DEBUG  console.log('attached');
  attachToWindow(browserWindow);
}

function attachToWindow (browserWindow) {
  var domWindow = viewFor(browserWindow);

  domWindow.document
    .addEventListener('PluginBindingAttached',
                      pluginEvent, true, true);
}

function pluginEvent(event) {
  var worker = null;
  element = event.target;
  if (element.tagName != 'EMBED') {
    return;
  }
  // not sure if that's the right tab.
  worker = tabs.activeTab.attach({
    contentScriptFile: self.data.url('video-replacer.js')
  });

  worker.port.emit('noFlash');
}

