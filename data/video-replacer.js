//
// This is injected in the content.
// Author: Hubert Figuiere
//


function matchYT(url, width, height) {
  // YOUTUBE
  var matches = url.match('^(?:https?:)?\/\/(?:www\.)?youtube(?:(?:-nocookie)|(?:\.googleapis))?\.com/v/([A-Za-z0-9_\-]{11})');
  if (matches) {
    return {
      type: "youtube",
      src: url,
      width: width,
      height: height,
      videoid: matches[1],
      processor: replaceYT
    };
  }
  return null;
}

function matchVimeo(url, width, height) {
  // VIMEO
  var matches = url.match('^(?:https?:)?\/\/(?:www\.)?vimeo.com/moogaloop\.swf\?.*clip_id=([0-9]*)');
  if (matches) {
    return {
      type: "vimeo",
      src: url,
      width: width,
      height: height,
      videoid: matches[1],
      processor: replaceVimeo
    };
  }
  return null;
}

function matchDailymotion(url, width, height) {
  // DAILYMOTION
  matches = url.match('^(?:https?:)?\/\/(?:www\.)?dailymotion.com/swf/(?:video/)?(.*)');
  if (matches) {
    return {
      type: "dailymotion",
      src: url,
      width: width,
      height: height,
      videoid: matches[1],
      processor: replaceDailymotion
    };
  }
  return null;
}

function analyzeObject(element) {
  if (element.localName != 'embed') {
    console.error("No child or element to analyze in",
                  element ? element.localName : '(null)');
    return {
      type: "notflash"
    };
  }
  var width, height;
  width = element.getAttribute("width");
  height = element.getAttribute("height");

  var embed_type = element.getAttribute("type")
  if (embed_type != "application/x-shockwave-flash") {
//DEBUG    console.log("Not flash, but", embed_type);
    return {
      type: "notflash"
    };
  }

//      allowfullscreen = element.getAttribute("allowfullscreen");

  if (element.hasAttribute('src')) {
    var url = element.getAttribute('src');

//DEBUG        console.log("matching url", url);

    var match = matchYT(url, width, height);
    if (match) {
      return match;
    }

    match = matchVimeo(url, width, height);
    if (match) {
      return match;
    }

    match = matchDailymotion(url, width, height);
    if (match) {
      return match;
    }

    return {
      type: "unsupported"
    };
  }
}

// replace the Dialymotion embed by its iframe
function replaceDailymotion(container, a) {
  if (a.type != "dailymotion") {
    console.error("Wrong type, got", a.type);
    return;
  }

  if (a.videoid === undefined) {
    console.error("Couldn't match Dailymotion video ID in URL", a.src);
    return ;
  }

  var replacement = document.createElement("iframe");
  replacement.setAttribute('src', 'https://www.dailymotion.com/embed/video/' + a.videoid);
  replacement.setAttribute('width', a.width);
  replacement.setAttribute('height', a.height);
  replacement.setAttribute('frameborder', '0');
//  replacement.setAttribute('webkitallowfullscreen'); // not needed
//  replacement.setAttribute('mozallowfullscreen'); // deprecated
  replacement.setAttribute('allowfullscreen', '');

  replaceObjectTag(container, replacement);
}


// replace the vimeo embed by its iframe
function replaceVimeo(container, a) {
  if (a.type != "vimeo") {
    console.error("Wrong type, got", a.type);
    return;
  }

  if (a.videoid === undefined) {
    console.error("Couldn't match VIMEO video ID in URL", a.src);
    return ;
  }

  var replacement = document.createElement("iframe");
  replacement.setAttribute('src', 'https://player.vimeo.com/video/' + a.videoid);
  replacement.setAttribute('width', a.width);
  replacement.setAttribute('height', a.height);
  replacement.setAttribute('frameborder', '0');
//  replacement.setAttribute('webkitallowfullscreen'); // not needed
//  replacement.setAttribute('mozallowfullscreen'); // deprecated
  replacement.setAttribute('allowfullscreen', '');

  replaceObjectTag(container, replacement);
}


// replace the youtube embed by its iframe
function replaceYT(container, a) {
  if (a.type != "youtube") {
    console.error("Wrong type, got", a.type);
    return;
  }

  if (a.videoid === undefined) {
    console.error("Couldn't match YT video ID in URL", a.src);
    return ;
  }

  var replacement = document.createElement("iframe");
  replacement.setAttribute('class', 'youtube-player');
  replacement.setAttribute('type', 'text/html');
  replacement.setAttribute('width', a.width);
  replacement.setAttribute('height', a.height);
  replacement.setAttribute('src', 'https://www.youtube.com/embed/' + a.videoid);
  replacement.setAttribute('allowfullscreen', '');
  replacement.setAttribute('frameborder', '0');

  replaceObjectTag(container, replacement);

//DEBUG  console.log("Replacing with ", replacement.outerHTML);
}

function replaceObjectTag(obj, replacement) {
  obj.parentNode.insertBefore(replacement, obj);
  obj.parentNode.removeChild(obj);
}

self.port.on("noFlash", function() {
  var elements = document.getElementsByTagName("embed")

  var embeds = [];
  for (var i = 0; i < elements.length; i++) {
    embeds.push(elements.item(i));
  }

  for (var i in embeds) {
    try {
//DEBUG      console.log('processing', i);
      var analyzed = analyzeObject(embeds[i]);

      if (typeof analyzed.processor === 'function') {
        analyzed.processor(embeds[i], analyzed);
      } else if (analyzed.type === 'unsupported') {
        //XXX do something.
      } else {
//DEBUG        console.log("Found unprocessable object", embeds[i].localName, "of type", analyzed.type);
      }
    }
    catch (e) {
      console.error("Exception:", e.message, e.stack);
    }
  }
});
