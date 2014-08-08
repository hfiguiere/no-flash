//
// This is injected in the content.
// Author: Hubert Figuiere
//


function analyzeObject(element) {
  var param = element ? element.firstChild : null;
  if (param === null) {
    console.error("No child or element to analyze in",
                  element ? element.localName : '(null)');
    return {
      type: "notflash"
    };
  }
  var width, height;
  width = element.getAttribute("width");
  height = element.getAttribute("height");

  while (param) {
    if (param.localName == 'embed') {

      var embed_type = param.getAttribute("type")
      if (embed_type != "application/x-shockwave-flash") {
        console.log("Not flash, but", embed_type);
        return {
          type: "notflash"
        };
      }

      width = param.hasAttribute("width") ? param.getAttribute("width") : width;
      height = param.hasAttribute("height") ? param.getAttribute("height") : height;
//      allowfullscreen = param.getAttribute("allowfullscreen");

      if (param.hasAttribute('src')) {
        var url = param.getAttribute('src');

//DEBUG        console.log("matching url", url);

        // YOUTUBE
        var matches = url.match('^https?:\/\/(?:www\.)?youtube\.(?:googleapis\.)?com/v/([A-Za-z0-9_\-]{11})');
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

        // VIMEO
        matches = url.match('^https?:\/\/(www\.)?vimeo.com/moogaloop\.swf\?.*clip_id=([0-9]*)');
        if (matches) {
          return {
            type: "vimeo",
            src: url,
            width: width,
            height: height,
            videoid: matches[2],
            processor: replaceVimeo
          };
        }

      }
    }
    param = param.nextSibling;
  }
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

//  console.log("Replacing with ", replacement.outerHTML);
}

function replaceObjectTag(obj, replacement) {
  obj.parentNode.insertBefore(replacement, obj);
  obj.parentNode.removeChild(obj);
}

self.port.on("noFlash", function() {
  var elements = document.getElementsByTagName("object")

  var embeds = [];
  for (var i = 0; i < elements.length; i++) {
    embeds.push(elements.item(i));
  }

  for (var i in embeds) {
    try {
      console.log('processing', i);
      var analyzed = analyzeObject(embeds[i]);

      if (typeof analyzed.processor === 'function') {
        analyzed.processor(embeds[i], analyzed);
      } else {
        console.log("Found unprocessable object", embeds[i].localName, "of type", analyzed.type);
      }
    }
    catch (e) {
      console.error("Exception:", e.message, e.stack);
    }
  }
});
