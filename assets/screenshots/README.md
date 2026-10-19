# App screenshots

These are real screenshots of the fictional populated plan supplied for the website. The original PNG and JPG files have not been modified.

- `screens/`: 13 compressed, unframed WebP screenshots: nine refreshed from the current supplied batch and four retained because no like-for-like replacement was supplied.
- `framed/`: all 13 screens inside custom iPhone 17-style front illustrations, with two responsive sizes per image. The funding chart uses a landscape frame.
- `widgets/`: three real Home Screen widget crops, each supplied as 480px and 960px WebP variants with transparent rounded corners.
- `manifest.json`: source filenames, descriptive names, dimensions, file sizes and widget crop coordinates.

The current batch refreshes `my-plan`, `spending-leisure`, `timeline`, `overview`, `scenario-grid`, `life-events`, `spending-summary`, `scenario-detail` and `funding-chart`. `pot-and-spending`, `spending-transport`, `next-steps` and `scenario-summary` are retained from the prior batch because no counterpart was supplied. Web copies use quality-90 WebP, sRGB colour and no capture metadata. App information is not retouched or stretched; the illustrated display masks only the outer corners. A Dynamic Island is added when it is absent from the screenshot.

The homepage uses `overview`; the gallery uses `my-plan`, `spending-leisure`, `timeline`, `scenario-grid`, `next-steps`, `life-events`, `spending-summary` and `scenario-detail`. The expanded `funding-chart` appears separately. The Home Screen widget section uses the real `widget-line`, `widget-dots` and `widget-calendar` crops. Each widget crop is a 1030×488px area from `IMG_3284.jpg`, with its coordinates and transparent 76px corner mask recorded in the manifest. `IMG_3283.png` is an alternate funding-chart detail state with no separate website position, and is recorded in the manifest rather than displayed.

These are custom device illustrations, not Apple-supplied marketing frames. Device reference: [iPhone 17 specifications](https://www.apple.com/uk/iphone-17/specs/).

To regenerate, use `Tools/prepare_website_screenshots.py` from the full app project ZIP with Pillow installed. Supply the source screenshot folder and this output folder as its two arguments. The website itself needs no build tools.
