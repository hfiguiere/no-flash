var self = require("sdk/self");

require("sdk/tabs").on("ready", noFlash);


function noFlash(tab) {
  console.log(tab.url);
  tab.attach({
    contentScriptFile: self.data.url('video-replacer.js')
  });
}
