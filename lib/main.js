var self = require("sdk/self");
var { viewFor } = require("sdk/view/core");
var tabs = require("sdk/tabs");

var domWindow = viewFor(tabs.activeTab.window);

domWindow.document
    .addEventListener('PluginBindingAttached',
                      pluginEvent, true, true);

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

