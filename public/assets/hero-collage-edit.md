# Original hero: pixel-preserving background removal

Active asset: `vivienne-hero-original-cutout.png`

Source: original user upload, not the generated cutout.

Method: deterministic Pillow flood-fill of near-white exterior pixels connected to the image boundary. Only alpha is set to zero for those pixels. RGB values are unchanged throughout the image; all retained pixels are copied directly from the original. No generation, face retouching, resampling, or reconstruction.

Checks: every RGB pixel equals the original; portrait interior is byte-identical including alpha. Original dimensions are preserved.
