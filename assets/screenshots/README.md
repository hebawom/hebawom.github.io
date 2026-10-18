# App screenshots

These are real screenshots of the fictional populated plan supplied for the website. The original PNG files have not been modified.

- `screens/`: 13 compressed, unframed WebP screenshots.
- `framed/`: all 13 screens inside custom iPhone 17-style front illustrations, with two responsive sizes per image. The funding chart uses a landscape frame.
- `manifest.json`: original filenames, descriptive names, dimensions and file sizes.

The source PNGs total 18,062,309 bytes. The unframed web copies total 1,240,956 bytes, a 93.1% reduction. Web copies use quality-90 WebP, sRGB colour and no capture metadata. App information is not retouched or stretched; the illustrated display masks only the outer corners. A Dynamic Island is added when it is absent from the screenshot.

The homepage uses `overview`; the gallery uses `my-plan`, `spending-leisure`, `timeline`, `scenario-grid`, `next-steps`, `life-events`, `spending-summary` and `scenario-detail`. The expanded `funding-chart` appears separately. Additional supplied screens remain available for future use; `scenario-summary` includes the live activity visible in the original capture and is not displayed on the site.

These are custom device illustrations, not Apple-supplied marketing frames. Device reference: [iPhone 17 specifications](https://www.apple.com/uk/iphone-17/specs/).

To regenerate, use `Tools/prepare_website_screenshots.py` from the full app project ZIP with Pillow installed. Supply the source screenshot folder and this output folder as its two arguments. The website itself needs no build tools.
