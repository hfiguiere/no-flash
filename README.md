A Firefox add-on to get rid of Flash video players.

Because there are two things I hate the most on the "web":
* Flash
* EME

If you have the Flash plugin enabled, then this addon is of no use for
you.

## What it does

Will replace known Flash embed with HTML5 equivalent.

* Youtube

* Vimeo: you need H264 support for that since Vimeo has always hated
royaltie free codec like WebM a preferred to tell Firefox users to
install Safari, even on Linux.

The original Mozilla bug:
https://bugzilla.mozilla.org/show_bug.cgi?id=769117

See doc/main.md for more details.

## To install

Visit https://addons.mozilla.org/en-US/firefox/addon/no-flash/

## To build

Install the Add-on SDK https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Installation

    cfx xpi

Then drop the no-flash.xpi file into you browser.

## Status

This is currently experimental. But I use it every day.

## Source code

https://github.com/hfiguiere/no-flash

## License

MPL v2
