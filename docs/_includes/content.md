[![GitHub release](https://img.shields.io/github/release/bs-detector/bs-detector.svg)](https://github.com/bs-detector/bs-detector/releases) [![Chrome downloads](https://img.shields.io/chrome-web-store/d/dlcgkekjiopopabcifhebmphmfmdbjod.svg)](https://chrome.google.com/webstore/detail/dlcgkekjiopopabcifhebmphmfmdbjod/) [![Firefox downloads](https://img.shields.io/amo/d/bsdetector.svg)](https://addons.mozilla.org/en-US/firefox/addon/bsdetector/) [![GitHub contributors](https://img.shields.io/github/contributors/bs-detector/bs-detector.svg)](https://github.com/bs-detector/bs-detector/graphs/contributors) [![Gitter](https://img.shields.io/gitter/room/nwjs/nw.js.svg)](https://gitter.im/bs-detector) [![GitHub stars](https://img.shields.io/github/stars/bs-detector/bs-detector.svg?style=social&label=Star)](https://github.com/bs-detector/bs-detector/subscription) [![Twitter Follow](https://img.shields.io/twitter/follow/bsdetectorapp.svg?style=social&label=Follow)](https://twitter.com/bsdetectorapp)

**We've been nominated for a Golden Kitty from Product Hunt for Chrome Extension of the Year! [Vote here!](https://www.producthunt.com/@goldenkittymeow/collections/2016-chrome-extension-of-the-year)**

**B.S. Detector** is a rejoinder to Mark Zuckerberg's dubious claims that Facebook is unable to substantively address the proliferation of fake news on its platform. A browser extension for both Chrome and Mozilla-based browsers, B.S. Detector searches all links on a given webpage for references to unreliable sources, checking against a manually compiled list of domains. It then provides visual warnings about the presence of questionable links or the browsing of questionable websites:

![bs-detector-alert](/images/alert.png){:class="bs-detector-img"}

The B.S. Detector is powered by [OpenSources](http://opensources.co), a professionally curated list of unreliable or otherwise questionable sources. We no longer maintain our own dataset. Neither the B.S. Detector nor the Self Agency LLC assume liability for the accuracy of OpenSources' data. To suggest or dispute a site's inclusion, [file an issue with OpenSources](https://github.com/bigmclargehuge/opensources).

Example domain classifications (in flux) include:

-   **Fake News:** Sources that fabricate stories out of whole cloth with the intent of pranking the public.
-   **Satire:** Sources that provide humorous commentary on current events in the form of fake news.
-   **Extreme Bias:** Sources that traffic in political propaganda and gross distortions of fact.
-   **Conspiracy Theory:** Sources that are well-known promoters of kooky conspiracy theories.
-   **Rumor Mill:** Sources that traffic in rumors, innuendo, and unverified claims.
-   **State News:** Sources in repressive states operating under government sanction.
-   **Junk Science:** Sources that promote pseudoscience, metaphysics, naturalistic fallacies, and other scientifically dubious claims.
-   **Hate Group:** Sources that actively promote racism, misogyny, homophobia, and other forms of discrimination.
-   **Clickbait:** Sources that are aimed at generating online advertising revenue and rely on sensationalist headlines or eye-catching pictures.
-   **Proceed With Caution:** Sources that may be reliable but whose contents require further verification.

---

## Installation
<a name="chrome"></a>

### Chrome and Chrome-based browsers
[Click here](https://chrome.google.com/webstore/detail/dlcgkekjiopopabcifhebmphmfmdbjod/) to go to the Chrome Web Store and click 'Install.' The plugin is compatible with all Chromium browsers, including Opera (with the [Chrome Extension extension](https://addons.opera.com/en/extensions/details/download-chrome-extension-9/)).

<a name="firefox"></a>

### Firefox and Mozilla-based browsers
[Click here](https://addons.mozilla.org/en-US/firefox/addon/bsdetector/) to go to the Firefox Add-ons Directory and click 'Add to Firefox.' **Note:** We are still awaiting the approval of the B.S. Detector by the Firefox Add-ons directory.

<a name="other"></a>

### Other browsers
Support for Safari and Edge is on our roadmap. For now, you can use an older version of the B.S. Detector as a browser script. Install [Tampermonkey](https://tampermonkey.net) for [Safari](https://tampermonkey.net/?ext=dhdg&browser=safari), [Edge](https://tampermonkey.net/?ext=dhdg&browser=edge), or any other available browser, then install the browser script [here](https://github.com/bs-detector/bs-detector/blob/dev/browserscript/bs-detector.user.js).

---

## Contributing

We welcome pull requests and community collaboration. See our [Github page](https://github.com/bs-detector/bs-detector) for guidelines.
