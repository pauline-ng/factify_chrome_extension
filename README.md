
# Factify Chrome Extension

Factify Chrome Extension is Chrome Extension that helps background processing for facts donors as a part of [FactPub project](http://factpub.org)

Requirement
-----------

[Installer of the host program for Chrome Extension](https://github.com/sunsagong/factify_chrome_extension_nativeapp) - host program that runs on local machine.

Installation
------------

Will be available in [Google App Store](https://chrome.google.com/webstore/detail/ohbgdjppihkipbmeickolladmlchknjg) soon.

Build & Run
-----------

*  `git clone https://github.com/sunsagong/factify_chrome_extension.git`
*  (or download ZIP from the green button above right on this page and expand somewhere on your machine.)
* Chrome Browser: [Setting] -> [Extension] -> [Load unpacked extension] -> [Choose the downloaded folder]

![Load Extension in Chrome Browser](http://factpub.org/img/factify_chrome_extension_loading.png)

* Check [Enable] and the extension runs in Developer mode.
* Browse PDF file via Chrome Browser and the page action starts running background extraction process.
* _[host program](https://github.com/sunsagong/factify_chrome_extension_nativeapp) must be pre-installed for background extraction processing_

Architecture
------------

This program uses [Native Messaging protocol](https://developer.chrome.com/extensions/nativeMessaging) to run Java program as a background process.
[Host program](https://github.com/sunsagong/factify_chrome_extension_nativeapp) must be installed prior to install this extension.

About FactPub
-------------

![FactPub](http://factpub.org/img/logo_factpub.png)

[FactPub](http://factpub.org/) is the project that helps scientific facts accessible to general public in legal manner.

Publications
------------



* [Breaking Down Paywalls for Online Health(Pauline Ng, Xiaocheng Huang, Sun Sagong and Lucas Tan: Healthcare Data Science , ODSC East 2016)](https://www.opendatascience.com/conferences/pauline-ng-breaking-down-paywalls-for-online-health/)

* [Enabling Public Access to Non-Open Access Biomedical Literature via Idea-Expression Dichotomy and Fact Extraction (Huang Xiaocheng & Pauline Ng - AAAI on Artificial Intelligence: Scholarly Big Data: AI Perspectives, Challenges, and Ideas, 2016)](http://www.aaai.org/ocs/index.php/WS/AAAIW16/paper/viewPaper/12557)

License
-------

The content of this repository is licensed under [GNU GPLv3](http://choosealicense.com/licenses/gpl-3.0/)
