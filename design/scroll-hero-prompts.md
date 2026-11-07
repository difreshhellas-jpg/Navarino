# Octopus scroll hero: generation prompts

The Kitchen section already has the component (`src/components/fx/effects/dishSequence.ts`).
Until frames exist it shows `food/027` with animated labels. When you have frames, drop them in
and it switches over on its own (see "Stage 3" below).

## Stage 0 (answered in the brief)

| | |
|---|---|
| Product | Charcoal-grilled octopus with fava, as in `food/027` |
| Elements (closed list) | 2 octopus tentacle pieces, fava purée, lemon wedge, capers, red onion rings, olive oil drops, oregano sprigs |
| Prop explicitly allowed | the white wavy square plate (you named it, so it stays in; nothing else) |
| Orientation | two versions: **16:9 centred** (desktop) and **9:16 centred** (phones) |
| Surface | **orange-red tablecloth**, matching the real photo (white marble was the alternative) |

Set the aspect ratio in the tool itself (Leonardo / Kling setting), not only in the prompt.
Generate 3–4 variations of each and keep the cleanest: AI video varies a lot run to run.

---

## Stage 1: reference images (Leonardo)

Make each image twice: once at **16:9**, once at **9:16**. Only the bracketed orientation changes.

### Reference image 1: the plated dish, whole

> A single plate of charcoal-grilled octopus with fava, standing alone on an orange-red patterned cotton tablecloth, no hands, no cutlery/utensils, no glasses, no background props. Two thick charred octopus tentacles curled on a white wavy-edged square ceramic plate, beside two smooth rounds of bright yellow fava purée topped with a few capers and thin red onion rings, a lemon wedge, a drizzle of golden olive oil and a scattering of dried oregano. Positioned dead-center in a **[16:9 horizontal | 9:16 vertical]** frame with balanced empty space around it. Studio product photography lighting, soft even light from top-left, subtle soft shadow beneath, shallow depth of field with clean blurred background. Photorealistic, hyper-detailed texture, natural color. Straight-on eye-level angle, 4K commercial product photography, isolated subject.

### Reference image 2: opened, elements floating

> A single plate of charcoal-grilled octopus with fava, its components lifted apart and floating alone above an orange-red patterned cotton tablecloth, no hands, no cutlery/utensils, no glasses, no background props, centered in a **[16:9 horizontal | 9:16 vertical]** frame. The white wavy-edged square ceramic plate stays below; around and above it, two charred octopus tentacle pieces, two soft rounds of yellow fava purée, a lemon wedge, a few capers, thin red onion rings, glistening drops of golden olive oil and small sprigs of oregano hover separated in mid-air in a cinematic arrangement, each suspended at slightly different depths as if frozen mid-fall toward the plate. Soft dramatic studio lighting, a faint wisp of charcoal smoke rising from the tentacles, shallow depth of field, photorealistic, glossy realistic textures, dynamic but balanced composition, 4K commercial product photography, isolated subject.

---

## Stage 2: the video (image-to-video, from Reference image 1)

**Model:** Seedance 2.0 is currently the strongest for product image-to-video (it also accepts several
reference images, so you can give it both references); Kling 3.0 is the best-value alternative and
what the brief named. Veo 3.1 if you want the most photoreal light and are fine paying for it.
Checked October 2026.

### Prompt (use the same text for 16:9 and 9:16, swapping the bracket)

> A single plate of charcoal-grilled octopus with fava, positioned dead-center in a **[16:9 horizontal | 9:16 vertical]** frame, alone on an orange-red patterned cotton tablecloth, no hands, no utensils, no glasses, no other objects in frame at any point, staying perfectly centered throughout.
>
> First 4 seconds: the camera performs a smooth, slow 360-degree orbit around the whole plate at eye level, keeping it locked dead-center, soft warm studio lighting, shallow depth of field with clean blurred background.
>
> Then, over the next 5-6 seconds: the dish comes apart gently, remaining centered, and two charred octopus tentacle pieces, two rounds of yellow fava purée, a lemon wedge, capers, thin red onion rings, drops of golden olive oil and small oregano sprigs lift off and separate from the white wavy square plate, floating and gently orbiting in mid-air around it in a cinematic, weightless arrangement, each element catching soft rim light as it drifts. Camera slowly pulls back, keeping the plate centered, revealing the full floating composition.
>
> Physically graceful, continuous motion throughout, no cuts, no distortion, no warping, no hands or utensils entering frame at any point. Photorealistic, hyper-detailed textures, dramatic soft studio lighting, 4K commercial product photography look, 24fps, smooth cinematic motion**[, vertical portrait format]**.

### Negative prompt (always)

> hands, fingers, person, human, utensils, fork, knife, glasses, bottles, table setting, cutting board, background clutter, text, watermark, cuts, jump cuts, morphing, warping, blurry, low quality, distorted proportions, extra tentacles, whole octopus, raw octopus, bread, fries, off-center subject**[, horizontal composition]** (add the last one only for the 9:16 version)

If the single generation glitches at the orbit → float hand-over, make two separate clips instead
(one from each reference image) and stitch them: more steps, more reliable.

---

## Stage 3: frames for the site

Extract **~120 frames at equal time intervals**, resize to the width they will actually render at
(desktop 1600px, phone 900px), encode AVIF (q≈60–70) + WebP (q≈80). Keep the whole AVIF set under ~8 MB.

Put them here, zero-padded to 4 digits:

```
public/frames/octopus/frame-0001.avif … frame-0120.avif   (+ .webp)   ← 16:9
public/frames/octopus/mobile/frame-0001.avif …            (+ .webp)   ← 9:16 (optional)
public/frames/octopus/frames.json
```

`frames.json` is what switches the section from the still photo to the sequence:

```json
{ "count": 120, "pad": 4, "formats": ["avif", "webp"], "aspect": 1.7778,
  "mobile": { "count": 120, "aspect": 0.5625 } }
```

Leave out `"mobile"` if you only make the 16:9 video; phones then use the desktop frames.

Then retune the floating labels in `content/dish-octopus.json` → `frameLabels` (x,y = the dot on
each element at the moment the label appears; lx,ly on phones, wx,wy on desktop; `at` = scroll
progress 0–1). The current values are placeholders around the centre.

## Optional: freddo cappuccino (Café section)

Not built: a second pinned sequence in the morning would sit right before the pinned "day by the
sea" strip, and two pins back to back break the pacing rule. If you still want it, the same
component can run it with `/frames/freddo/` and `drinks/126` as the still. Elements: ice cubes,
coffee beans, milk foam cloud, basil sprig, paper straw.
