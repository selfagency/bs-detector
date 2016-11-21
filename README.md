# 💩 B.S. Detector

![screenshot](https://s22.postimg.org/ru4qaxndt/another_example_of_the_extensions_functionality.jpg)

## 📖 About

This is a project I threw together in under an hour to push back against Mark Zuckerberg's claim that Facebook is unable to do something about the proliferation of fake news on their platform. It is a proof of concept and not a fully developed product. You can read more about my reasoning behind it [here](https://www.inverse.com/article/23781-bs-detector-facebook-fake-news-daniel-sieradski).

The B.S. Detector works by searching all links on a given webpage for the domains of questionable websites, checking against a manually compiled list. It then provides a tooltip warning the user when they hover over the link of a questionable site.

The list was compiled from various sources around the web. You can view the complete list [here](https://github.com/selfagency/bs-detector/blob/master/chrome/data/data.json). We are actively in the process of reviewing the dataset, categorizing entries, and removing misidentified domains.

Classifications include:
+ Fake News: Sources that fabricate stories out of whole cloth with the intent of pranking the public.
+ Satire: Sources that provide humorous commentary on current events in the form of fake news.
+ Extreme Political Bias: Sources that traffic in political propaganda and distortions.
+ Conspiracy Theory: Sources that are well-known promoters of crank conspiracy theories.
+ State News: Government-sanctioned news sources in repressive states.
+ Junk Science: Sources that promote scientifically dubious claims, most often about public health.
+ Hate Group: Sources that actively promote racism, misogyny, homophobia, and other forms of hate.

If there are any sites you'd recommend adding or removing from the list, or if you object to your site being listed, you can submit an issue or a pull request above.

## 🛠 Installation

[Click here](https://chrome.google.com/webstore/detail/dlcgkekjiopopabcifhebmphmfmdbjod/) to go to the Chrome Web Store and click 'Install.' The plugin is compatible with all Chromium browsers, including Opera.
