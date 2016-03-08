# kimchi.js
Kimchi.js - The Korean Transcription Library

**What is kimchi?**

Kimchi (김치) is a yummy traditional fermented Korean side dish, made of vegetables with a variety of seasonings. In traditional preparation, kimchi was stored underground in jars to keep cool during the summer months and unfrozen during the winter months. There are hundreds of varieties of kimchi made from napa cabbage, radish, scallion, or cucumber as a main ingredient.

*Source: [Wikipedia](https://en.wikipedia.org/wiki/Kimchi)*

**So, what's kimchi.js then...?**

Kimchi.js is a JavaScript library used for the display of Korean Unicode on modern day browsers. It allows the display of Romanized Korean text, but in the event that JavaScript is available to the browser, the text can be converted to Korean Unicode on said browser. This means that you have a shim of sorts that would still work in conveying your message whether the browser's JavaScript was turned off or on. Cool, huh?

**How do I use it?**

Kimchi.js is used in one of two ways:

1) You can fashion Korean romanized text within <kimchi> tags and then proceed with an `onload` event within the `<body>` tag to activate it using the `ferment()` method:

`<body onLoad="kimchi.ferment();">`

which will transcribe all romanized text within the `<kimchi>` tags

2) You can call on-the-fly transcriptions to generate Korean text that can be used for later:

e.g. `document.getElementById("test").innerHTML = kimchi.pickle("pyeong-yang");`

**Are there any current limitations?**

There may possibly be one, there are a number of words that may not render correctly, generally certain words whose transcription in romanized Korean differs to its equivalent in Korean. If you do come across any discrepancies whilst using this library, please let me know ASAP.







