# 💩 B.S. Detector

![screenshot](https://s22.postimg.org/ru4qaxndt/another_example_of_the_extensions_functionality.jpg)

## 📖 About

This is a project I threw together in under an hour to push back against Mark Zuckerberg's claim that Facebook is unable to do something about the proliferation of fake news on their platform. It is a proof of concept and not a fully developed product. You can read more about my reasoning behind it [here](https://www.inverse.com/article/23781-bs-detector-facebook-fake-news-daniel-sieradski).

The B.S. Detector works by searching all links on a given webpage for the domains of questionable websites, checking against a manually compiled list. It then provides a tooltip warning the user when they hover over the link of a questionable site.

The list was compiled from various sources around the web and consists chiefly of websites that traffic in fake news, parody news, unsourced claims, fabrications, innuendo, and conspiracy theory. I have done my absolute best to stay wholly objective and as such the entries span the political spectrum.

You can view the complete list [here](https://github.com/selfagency/bs-detector/blob/master/chrome/data/data.json).

If there are any sites you'd recommend adding or removing from the list, or if you object to your site being listed, you can submit an issue or a pull request above.

## 🛠 Installation

[Click here](https://chrome.google.com/webstore/detail/dlcgkekjiopopabcifhebmphmfmdbjod/) to go to the Chrome Web Store and click 'Install.' The plugin is compatible with all Chromium browsers, including Opera.
