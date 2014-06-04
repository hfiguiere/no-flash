
function analyzeObject(element) {
  var param = element.firstChild;
  while (param) {
    if (param.localName == 'embed') {
      var width, height;

      width = element.getAttribute("width");
      height = element.getAttribute("height");

      if (param.hasAttribute('src')) {
        var url = param.getAttribute('src');
        if (url.match("http.*youtube.com")) {
          return {
            type: "youtube",
            src: url,
            width: width,
            height: height
          };
        }
      }
    }
    else if (param.localName == 'param') {
      
    }
    param = param.nextSibling;
  }
}

function replaceYT(container, a) {
  if (a.type != "youtube") {
    console.error("Wrong type, got", a.type);
    return;
  }

  var matches = a.src.match('^https?:\/\/(www\.)?youtube\.com/v/([A-Za-z0-9_\-]{11})');
  var video_id;
  if (matches) {
    video_id = matches[2];
  }
  if (video_id === undefined) {
    console.error("Couldn't match video ID in URL", a.src);
    return ;
  }

  var replacement = document.createElement("span");

  var html = '<iframe class="youtube-player" type="text/html" width="' + a.width + '" height="' + a.height + '" src="http://www.youtube.com/embed/' + video_id + '" allowfullscreen frameborder="0"></iframe>';
  replacement.innerHTML = html;
  console.log("Replacing with ", html);
  container.parentNode.insertBefore(replacement, container);
  container.parentNode.removeChild(container);
}

var elements = document.getElementsByTagName("object")

console.log("Elements count", elements.length);

for (var i = 0; i < elements.length; i++) {
  try {
    var analyzed = analyzeObject(elements[i]);

    if (analyzed.type == "youtube") {
      replaceYT(elements[i], analyzed);
    }
    console.log("Found object of type", analyzed.type);
  }
  catch(e) {
    console.error("Exception:", e);
  }
}

