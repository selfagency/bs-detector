# 💩 B.S. Detector

This Chrome extension was hastily assembled as a rejoinder to Mark Zuckerberg's dubious claims that Facebook is unable to substantively address the proliferation of fake news on its platform. The B.S. Detector searches all links on a given webpage for references to unreliable sources, checking against a manually compiled list of domains. It then provides a visual warning to the user when they hover over a questionable link, or, if the user is on Facebook, with a large alert bar at the top of any post containing a questionable link. The B.S. Detector is a proof of concept, not a fully developed product, and is presently undergoing development. You can read more about the extension's origins [here](https://www.inverse.com/article/23781-bs-detector-facebook-fake-news-daniel-sieradski).

The list of domains powering the B.S. Detector was somewhat indiscriminately compiled from various sources around the web. We are actively reviewing this dataset, categorizing entries, and removing misidentified domains. We thus cannot guarantee complete accuracy of our data at the moment. You can view the complete list [here](https://github.com/selfagency/bs-detector/blob/master/chrome/data/data.json).

Domain classifications include:
+   **Fake News:** Sources that fabricate stories out of whole cloth with the intent of pranking the public.
+   **Satire:** Sources that provide humorous commentary on current events in the form of fake news.
+   **Extreme Political Bias:** Sources that traffic in political propaganda and gross distortions of fact.
+   **Conspiracy Theory:** Sources that are well-known promoters of kooky conspiracy theories.
+   **State News:** Sources in repressive states operating under government sanction.
+   **Junk Science:** Sources that promote scientifically dubious claims, most often about natural products.
+   **Hate Group:** Sources that actively promote racism, misogyny, homophobia, and other forms of discrimination.

If there are any sites you recommend adding or removing, or if you object to your site being listed, you can submit an issue or a pull request above.

## 🛠 Installation

[Click here](https://chrome.google.com/webstore/detail/dlcgkekjiopopabcifhebmphmfmdbjod/) to go to the Chrome Web Store and click 'Install.' The plugin is compatible with all Chromium browsers, including Opera.
