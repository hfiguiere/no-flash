
function analyzeObject(element) {
  if (!element) {
    console.error("Null object to analyze");
    return {
      type: "notflash"
    };
  }
  var param = element.firstChild;
  if (!param) {
    console.error("No child to analyze");
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

        console.log("matching url", url);

        // YOUTUBE
        var matches = url.match('^https?:\/\/(www\.)?youtube\.com/v/([A-Za-z0-9_\-]{11})');
        if (matches) {
          return {
            type: "youtube",
            src: url,
            width: width,
            height: height,
            videoid: matches[2]
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
            videoid: matches[2]
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
    console.error("Couldn't match video ID in URL", a.src);
    return ;
  }

  var replacement = document.createElement("span");

  var html = '<iframe src="//player.vimeo.com/video/' + a.videoid + '" width="' + a.width + '" height="' + a.height + '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
  replacement.innerHTML = html;
  console.log("Replacing with ", html);
  container.parentNode.insertBefore(replacement, container);
  container.parentNode.removeChild(container);

}


// replace the youtube embed by its iframe
function replaceYT(container, a) {
  if (a.type != "youtube") {
    console.error("Wrong type, got", a.type);
    return;
  }

  if (a.videoid === undefined) {
    console.error("Couldn't match video ID in URL", a.src);
    return ;
  }

  var replacement = document.createElement("span");

  var html = '<iframe class="youtube-player" type="text/html" width="' + a.width + '" height="' + a.height + '" src="http://www.youtube.com/embed/' + a.videoid + '" allowfullscreen frameborder="0"></iframe>';
  replacement.innerHTML = html;
  console.log("Replacing with ", html);
  container.parentNode.insertBefore(replacement, container);
  container.parentNode.removeChild(container);
}

var elements = document.getElementsByTagName("object")
console.log("Elements count", elements.length);
var embeds = [];
for (var i in elements) {
  embeds.push(elements[i]);
}

for (var i in embeds) {
  try {
    var analyzed = analyzeObject(embeds[i]);

    if (analyzed.type == "youtube") {
      replaceYT(embeds[i], analyzed);
    }
    else if (analyzed.type = "vimeo") {
      replaceVimeo(embeds[i], analyzed);
    }
    console.log("Found object of type", analyzed.type);
  }
  catch(e) {
    console.error("Exception:", e.message, e.stack);
  }
}

