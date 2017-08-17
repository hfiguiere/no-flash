A browser add-on to replace Flash video players by their HTML5 counterpart.

Originally developed for Firefox, now that it is a WebExtension, it works
in Google Chrome as well.

Because there are two things I hate the most on the "web":

* Flash
* EME
* Chrome specific sites that claim to be the web.

Let's tackle Flash.

This feature has been reimplemented in Firefox 47 and Chrome 54.
* https://bugzilla.mozilla.org/show_bug.cgi?id=769117
* https://groups.google.com/a/chromium.org/forum/#!msg/chromium-dev/BW8g1iB0jLs/uddWuBroBAAJ

If you have the Flash plugin enabled, then this addon is of no use for
you.

## What it does

Will replace known Flash embed on third party website with the HTML5 equivalent.

* Youtube
* Vimeo
* Dailymotion

The original Mozilla bug:
https://bugzilla.mozilla.org/show_bug.cgi?id=769117

See doc/main.md for more details.

## To install

Visit https://addons.mozilla.org/en-US/firefox/addon/no-flash/

## To build

This is a regular WebExtension. Just load it into the browser.

## Status

This is currently experimental. But I use it every day.

## Source code

https://github.com/hfiguiere/no-flash

## License

MPL v2
