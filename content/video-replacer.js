//
// This is injected in the content.
// Author: Hubert Figuiere
//


function matchYT(url, width, height) {
  // YOUTUBE
  var matches = url.match('^(?:https?:)?\/\/(?:www\.)?youtube(?:(?:-nocookie)|(?:\.googleapis))?\.com/v/([A-Za-z0-9_\-]{11})');
  if (matches) {
    return {
      type: 'youtube',
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
      type: 'vimeo',
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
      type: 'dailymotion',
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
  let url;
  let width, height;

  width = element.getAttribute('width');
  height = element.getAttribute('height');

  let embed_type = element.getAttribute('type')
  if (embed_type != 'application/x-shockwave-flash') {
    return {
      type: "notflash"
    };
  }

  switch (element.localName) {

  case 'embed':
    if (!width || !height) {
      let parent = element.closest('object');
      width = parent.getAttribute('width');
      height = parent.getAttribute('height');
    }
    if (element.hasAttribute('src')) {
      url = element.getAttribute('src');
    }
    break;

  case 'object':
    let param = element.querySelector('param[name="src"]');
    if (param) {
      url = param.getAttribute('value');
    }
    if (!url) {
      return {
        type: "notflash"
      };
    }
    break;
  default:
    console.error('No child or element to analyze in' +
                  `${element ? element.localName : '(null)'}`);
    return {
      type: "notflash"
    };
  }

  //      allowfullscreen = element.getAttribute("allowfullscreen");

  let match = matchYT(url, width, height);
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
    type: 'unsupported'
  };
}

// replace the Dailymotion embed by its iframe
function replaceDailymotion(container, a) {
  if (a.type != 'dailymotion') {
    console.error(`Wrong type, got ${a.type}`);
    return;
  }

  if (a.videoid === undefined) {
    console.error(`Couldn't match Dailymotion video ID in URL ${a.src}`);
    return ;
  }

  let replacement = document.createElement('iframe');
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
  if (a.type != 'vimeo') {
    console.error(`Wrong type, got ${a.type}`);
    return;
  }

  if (a.videoid === undefined) {
    console.error("Couldn't match VIMEO video ID in URL", a.src);
    return ;
  }

  let replacement = document.createElement('iframe');
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
  if (a.type != 'youtube') {
    console.error(`Wrong type, got ${a.type}`);
    return;
  }

  if (a.videoid === undefined) {
    console.error(`Couldn't match YT video ID in URL ${a.src}`);
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
}

function replaceObjectTag(obj, replacement) {
  var ancestor = null;
  switch(obj.localName) {
  case 'embed':
    ancestor = obj.closest('object');
    break;
  case 'object':
    ancestor = obj.closest('embed');
    break;
  default:
    break;
  }
  if (ancestor) {
    obj = ancestor;
  }
  obj.parentNode.insertBefore(replacement, obj);
  obj.parentNode.removeChild(obj);
}

function elementsProcessor(elements) {
  let embeds = [];
  for (let element of elements) {
    embeds.push(element);
  }

  for (let embed of embeds) {
    try {
      let analyzed = analyzeObject(embed);

      if (typeof analyzed.processor === 'function') {
        analyzed.processor(embed, analyzed);
      } else if (analyzed.type === 'unsupported') {
        //XXX do something.
      } else {
      }
    }
    catch (e) {
      console.error("Exception:", e.message, e.stack);
    }
  }
}

let elements = document.getElementsByTagName("embed");
elementsProcessor(elements);
elements = document.getElementsByTagName("object");
elementsProcessor(elements);
