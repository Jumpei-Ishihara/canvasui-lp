# Canvas UI コンポーネント全リファレンス

> `https://canvasui.dev/r/registry.json`（150 items = 25 components × 6 frameworks）から機械抽出。
> オプション定義は React 実装のソース（`<Name>Options` interface）が一次情報。他フレームワークも同一オプション。

## 分類早見表

| # | Component | 種別 | 依存 | opts | 一行説明 |
|---|---|---|---|---|---|
| 1 | `Asciify` | Wrapper | — | 14 | Redraws your page as live ascii characters in a soft radius around the cursor, with real glyph, shade block, and binary ramps |
| 2 | `Bend` | Wrapper | — | 11 | Folds the top and bottom of your page over virtual edges as you scroll, like scrolling on the face of a cube |
| 3 | `Blaze` | Wrapper | — | 12 | Fire sparks, smoke, and heat distortion rising from the bottom of your page |
| 4 | `Bubble` | Wrapper | — | 17 | A glassy droplet that trails the cursor as blending metaballs and refracts the live page beneath it, with dispersion, frost, and an iridescent sheen |
| 5 | `Cloth` | Wrapper | — | 14 | Hangs your live HTML on a piece of fabric rippling in the wind, with softly lit folds |
| 6 | `Clouds` | Wrapper | — | 16 | Procedural fog that drifts over your page and blurs what it covers |
| 7 | `DitheredObject` | **Object** | three.js | 25 | Renders any GLB or glTF model in a floating studio scene through a 1-bit Bayer dither |
| 8 | `Droplets` | Wrapper | — | 17 | Rain droplets that run down the screen and refract your page behind them |
| 9 | `Frost` | Wrapper | — | 27 | Covers your page in a frozen pane of ice with refraction and frost grain |
| 10 | `Glass` | Wrapper | — | 15 | A cursor-following glass lens that refracts your page like real glass, with a crystal ball zoom over target elements |
| 11 | `GlassObject` | **Object** | three.js | 29 | Turns any GLB/glTF model, SVG, or image into a floating liquid-glass object with real refraction, chromatic dispersion, frost, and tinted absorption, lit by a studio environment |
| 12 | `Glitch` | Wrapper | — | 8 | Broadcast glitch bursts that tear the page into shifted slices with RGB splits, corrupted blocks, and analog noise, then settle back to a clean read |
| 13 | `Grid` | Wrapper | — | 17 | Splits your page into a grid of 3D tiles that ripple in waves around the cursor |
| 14 | `HexFloat` | Wrapper | — | 17 | Renders the live page onto a floor of shiny beveled hex tiles that lean back in perspective, bob gently, and rise toward the cursor |
| 15 | `Laser` | Wrapper | — | 15 | Hides everything below a glowing laser beam near the bottom of the viewport |
| 16 | `Liquid` | Wrapper | — | 14 | A pointer-driven WebGL fluid simulation over your page |
| 17 | `Magnify` | Wrapper | — | 21 | A sci-fi scanner lens that follows the cursor and magnifies the live page inside a configurable HUD reticle, with chromatic aberration haze and click ripples that bend the page |
| 18 | `ParticleObject` | **Object** | three.js | 27 | Rebuilds any GLB/glTF model, SVG, or image as a cloud of particles that the cursor pushes, swirls, and springs back into shape |
| 19 | `ParticleReveal` | Wrapper | — | 11 | Renders your page as fine grayscale dust that merges back into crisp UI around the cursor |
| 20 | `ParticleScroll` | Wrapper | — | 12 | Dissolves everything below a chosen line into drifting sand that reassembles as you scroll |
| 21 | `Peel` | Wrapper | — | 13 | Peels your page back from a chosen edge as the cursor approaches, revealing a second layer underneath |
| 22 | `RetroDither` | Wrapper | — | 14 | A retro dither lens that pixelates and quantizes your page around the cursor |
| 23 | `Ripple` | Wrapper | — | 10 | Water ripples that spread from every click and refract the live page like a pond surface, with dispersion and light glints on the crests |
| 24 | `Shatter` | Wrapper | — | 18 | Shatters your page into 3D glass shards that lift, tilt, and float around the cursor, refracting the content beneath them, with perspective and soft shadows |
| 25 | `VHS` | Wrapper | — | 15 | Plays your page back like a worn VHS tape, with tape wave, head-switch noise, chroma bleed, and grain |

合計オプション数: **409**

### 効果カテゴリ別（重複あり）

- **レンズ / カーソル追従**: `Glass`, `Magnify`, `Bubble`, `RetroDither`, `Asciify`
- **全面ポストエフェクト**: `VHS`, `Glitch`, `RetroDither`, `Clouds`, `Blaze`
- **物理・流体シミュレーション**: `Liquid`, `Ripple`, `Droplets`, `Cloth`, `Frost`
- **ジオメトリ変形**: `Shatter`, `Grid`, `HexFloat`, `Bend`, `Peel`
- **スクロール駆動**: `Laser`, `ParticleScroll`, `Bend`
- **パーティクル**: `ParticleReveal`, `ParticleScroll`, `Blaze`
- **3Dオブジェクト (three.js)**: `GlassObject`, `ParticleObject`, `DitheredObject`

---

## 全コンポーネント詳細

### Asciify

- **slug**: `asciify` / **install**: `npx shadcn@latest add @canvas-ui/asciify-react`
- **種別**: Wrapper（children を包む・html-in-canvas 必須）
- **docs**: https://canvasui.dev/docs/components/asciify

Redraws your page as live ascii characters in a soft radius around the cursor, with real glyph, shade block, and binary ramps. The HTML stays interactive. No dependencies.

```tsx
<Asciify>
  {/* 通常のHTML。インタラクティブ性は維持される */}
</Asciify>
```

#### Options (14)

| prop | type | 説明 |
|---|---|---|
| `radius` | `number` | Radius of the ascii lens around the cursor, relative to the screen height. |
| `softness` | `number` | Edge feather of the lens as a fraction of the radius (0 to 1). |
| `scale` | `number` | Size of one glyph pixel in CSS pixels. Characters are 5x5 glyph pixels. |
| `spacing` | `number` | Empty glyph pixels around each character (0 to 3). |
| `charset` | `AsciifyCharset` | Built-in character ramp: real ascii glyphs, shade blocks, or binary digits. |
| `glyphs` | `number[]` | Custom ramp of packed 5x5 bitmaps (dark to bright), overrides charset. |
| `background` | `[number, number, number] \| "auto"` | Paper color behind the glyphs as [r, g, b] in 0-1 range, or "auto" to match the page background. |
| `backgroundOpacity` | `number` | Opacity of the background behind the glyphs (0 to 1). |
| `contrast` | `number` | Contrast applied to character density before picking a glyph. |
| `brightness` | `number` | Density offset applied before picking a glyph (-1 to 1). |
| `invert` | `number` | Invert character density inside the effect (0 to 1). |
| `strength` | `number` | Coverage of asciified cells inside the lens (0 to 1). |
| `baseStrength` | `number` | Ascii coverage across the whole screen, outside the lens (0 to 1). |
| `followSpeed` | `number` | How quickly the lens follows the cursor. Higher is snappier. |

### Bend

- **slug**: `bend` / **install**: `npx shadcn@latest add @canvas-ui/bend-react`
- **種別**: Wrapper（children を包む・html-in-canvas 必須）
- **docs**: https://canvasui.dev/docs/components/bend

Folds the top and bottom of your page over virtual edges as you scroll, like scrolling on the face of a cube. The HTML stays interactive. No dependencies.

```tsx
<Bend>
  {/* 通常のHTML。インタラクティブ性は維持される */}
</Bend>
```

#### Options (11)

| prop | type | 説明 |
|---|---|---|
| `zone` | `number` | Height of the folded region at each edge in CSS pixels. |
| `angle` | `number` | Maximum fold angle in degrees, reached away from the scroll ends. 90 is a cube edge. |
| `rounding` | `number` | Radius in CSS pixels of the circular arc that rounds each fold crease. 0 keeps a sharp cube edge. Clamped to the zone height. |
| `perspective` | `number` | Perspective focal length in CSS pixels. Smaller values pinch the folded edges harder. |
| `direction` | `"out" \| "in"` | "out" folds the edges away from the viewer like the outside of a cube, "in" tilts them toward the viewer. |
| `ease` | `number` | Scroll distance in CSS pixels over which an edge flattens near its scroll end. |
| `smoothing` | `number` | Seconds the bend takes to settle after a scroll. 0 snaps instantly. |
| `top` | `boolean` | Bend the top edge. |
| `bottom` | `boolean` | Bend the bottom edge. |
| `tumble` | `number` | Overscroll tip strength (0 to 1). Rubber-banding past a scroll end tips the whole face over that edge. 0 disables. |
| `tilt` | `number` | Pointer tilt strength (0 to 1). The face leans subtly toward the cursor. 0 disables. |

### Blaze

- **slug**: `blaze` / **install**: `npx shadcn@latest add @canvas-ui/blaze-react`
- **種別**: Wrapper（children を包む・html-in-canvas 必須）
- **docs**: https://canvasui.dev/docs/components/blaze

Fire sparks, smoke, and heat distortion rising from the bottom of your page. The HTML stays interactive. No dependencies.

```tsx
<Blaze>
  {/* 通常のHTML。インタラクティブ性は維持される */}
</Blaze>
```

#### Options (12)

| prop | type | 説明 |
|---|---|---|
| `height` | `number` | Height of the blaze zone as a fraction of the screen (0 to 1). |
| `distortion` | `number` | Strength of the heat distortion bending the content. |
| `distortionScale` | `number` | Scale of the heat distortion noise. Higher means finer ripples. |
| `speed` | `number` | Animation speed multiplier for the whole effect. |
| `sparks` | `number` | Brightness of the rising sparks. 0 disables them. |
| `sparkDensity` | `number` | How tightly packed the sparks are. Higher also makes them smaller. |
| `sparkSize` | `number` | Size of the individual sparks. |
| `layers` | `number` | Number of spark layers stacked for depth (1 to 10). |
| `smoke` | `number` | Intensity of the smoke. 0 disables it. |
| `glow` | `number` | Warm ambient glow near the bottom edge. |
| `sparkColor` | `[number, number, number]` | Spark color as [r, g, b] in 0-1 range. |
| `smokeColor` | `[number, number, number]` | Smoke and glow color as [r, g, b] in 0-1 range. |

### Bubble

- **slug**: `bubble` / **install**: `npx shadcn@latest add @canvas-ui/bubble-react`
- **種別**: Wrapper（children を包む・html-in-canvas 必須）
- **docs**: https://canvasui.dev/docs/components/bubble

A glassy droplet that trails the cursor as blending metaballs and refracts the live page beneath it, with dispersion, frost, and an iridescent sheen. The HTML stays interactive. No dependencies.

```tsx
<Bubble>
  {/* 通常のHTML。インタラクティブ性は維持される */}
</Bubble>
```

#### Options (17)

| prop | type | 説明 |
|---|---|---|
| `size` | `number` | — |
| `trail` | `number` | — |
| `follow` | `number` | — |
| `blend` | `number` | — |
| `speed` | `number` | — |
| `refraction` | `number` | — |
| `dispersion` | `number` | — |
| `frost` | `number` | — |
| `shine` | `number` | — |
| `rim` | `number` | — |
| `iridescence` | `number` | — |
| `intensity` | `number` | — |
| `tint` | `[number, number, number]` | — |
| `tintStrength` | `number` | — |
| `colorA` | `[number, number, number]` | — |
| `colorB` | `[number, number, number]` | — |
| `fallbackOpacity` | `number` | — |

### Cloth

- **slug**: `cloth` / **install**: `npx shadcn@latest add @canvas-ui/cloth-react`
- **種別**: Wrapper（children を包む・html-in-canvas 必須）
- **docs**: https://canvasui.dev/docs/components/cloth

Hangs your live HTML on a piece of fabric rippling in the wind, with softly lit folds. Cursor strokes send waves across the cloth. The HTML stays interactive. No dependencies.

```tsx
<Cloth>
  {/* 通常のHTML。インタラクティブ性は維持される */}
</Cloth>
```

#### Options (14)

| prop | type | 説明 |
|---|---|---|
| `pin` | `ClothPin` | Edge the cloth hangs from. The opposite side swings free. |
| `wind` | `number` | Wind force driving the fabric (0 lets the waves die down). |
| `speed` | `number` | Playback speed of the cloth motion. |
| `amplitude` | `number` | Height of the fabric folds in CSS pixels. |
| `drape` | `number` | How many CSS pixels the cloth billows toward the viewer on a gust. |
| `brush` | `number` | Strength of the waves the cursor brushes across the fabric (0 disables). |
| `brushSize` | `number` | Radius of the cursor's influence in CSS pixels. |
| `damping` | `number` | How quickly waves settle (higher calms the fabric faster). |
| `light` | `number` | Strength of the directional lighting on the folds (0 to 1). |
| `sheen` | `number` | Strength of the soft sheen on fold crests (0 to 1). |
| `shadow` | `number` | Opacity of the contact shadow under the fabric (0 to 1). |
| `cornerRadius` | `number` | Corner radius of the fabric in CSS pixels. |
| `backing` | `[number, number, number] \| "auto"` | Fabric color behind transparent content as RGB in the 0 to 1 range, or "auto" to sample the page background. |
| `perspective` | `number` | Perspective focal length in CSS pixels. Lower exaggerates the 3D depth. |

### Clouds

- **slug**: `clouds` / **install**: `npx shadcn@latest add @canvas-ui/clouds-react`
- **種別**: Wrapper（children を包む・html-in-canvas 必須）
- **docs**: https://canvasui.dev/docs/components/clouds

Procedural fog that drifts over your page and blurs what it covers. Cursor movement parts the clouds. The HTML stays interactive. No dependencies.

```tsx
<Clouds>
  {/* 通常のHTML。インタラクティブ性は維持される */}
</Clouds>
```

#### Options (16)

| prop | type | 説明 |
|---|---|---|
| `scale` | `number` | — |
| `speed` | `number` | — |
| `cover` | `number` | — |
| `density` | `number` | — |
| `shading` | `number` | — |
| `color` | `[number, number, number] \| "auto"` | — |
| `opacity` | `number` | — |
| `shadow` | `number` | — |
| `shadowOffsetX` | `number` | — |
| `shadowOffsetY` | `number` | — |
| `shadowSoftness` | `number` | — |
| `wind` | `number` | — |
| `windRadius` | `number` | — |
| `refraction` | `number` | — |
| `fogBlur` | `number` | — |
| `quality` | `number` | — |

### DitheredObject

- **slug**: `dithered-object` / **install**: `npx shadcn@latest add @canvas-ui/dithered-object-react`
- **種別**: Object（three.js・childrenなし・全ブラウザ動作）
- **docs**: https://canvasui.dev/docs/components/dithered-object

Renders any GLB or glTF model in a floating studio scene through a 1-bit Bayer dither. Built on three.js.

```tsx
<DitheredObject src="/models/your-asset.glb" />
```

#### Options (25)

| prop | type | 説明 |
|---|---|---|
| `src` | `string` | URL of the GLB/glTF model to display. Object URLs from a file input work too. |
| `gridSize` | `number` | Size of the dither cells in CSS pixels. |
| `pixelSizeRatio` | `number` | Extra pixelation applied on top of the grid size (1 to 10). |
| `grayscale` | `boolean` | Collapse the scene to grayscale before dithering. |
| `invert` | `boolean` | Invert the final colors. |
| `dither` | `boolean` | Enable the dither pass. Turn off to see the raw render. |
| `background` | `string` | Background color behind the model. Empty string keeps the canvas transparent. |
| `highlight` | `string` | Accent color of the ring light in the studio environment. |
| `environmentIntensity` | `number` | Brightness of the studio environment lighting. |
| `roughness` | `number` | Roughness override applied to every material (0 to 1). Negative keeps the model's own values. |
| `scale` | `number` | Size of the longest side of the model in scene units. The camera sits about 4 units away. |
| `xOffset` | `number` | Horizontal offset of the model in scene units. |
| `yOffset` | `number` | Vertical offset of the model in scene units. |
| `floatIntensity` | `number` | Strength of the floating bob animation (0 disables). |
| `rotationIntensity` | `number` | Strength of the idle rocking rotation (0 disables). |
| `floatSpeed` | `number` | Speed of the float and rocking animation. |
| `orbit` | `boolean` | Let the user orbit the camera by dragging. |
| `zoom` | `boolean` | Let the user zoom with the scroll wheel or pinch. |
| `autoRotate` | `boolean` | Spin the camera around the model turntable-style. |
| `autoRotateSpeed` | `number` | Turntable speed when autoRotate is on. |
| `fov` | `number` | Camera field of view in degrees. |
| `cameraDistance` | `number` | Camera distance from the center of the model. |
| `dracoDecoderPath` | `string` | Base URL of the Draco decoder, fetched only when a model needs it. |
| `onLoad` | `(() => void) \| null` | Called after a model finishes loading. |
| `onError` | `((error: unknown) => void) \| null` | Called when a model fails to load. |

### Droplets

- **slug**: `droplets` / **install**: `npx shadcn@latest add @canvas-ui/droplets-react`
- **種別**: Wrapper（children を包む・html-in-canvas 必須）
- **docs**: https://canvasui.dev/docs/components/droplets

Rain droplets that run down the screen and refract your page behind them. The HTML stays interactive. No dependencies.

```tsx
<Droplets>
  {/* 通常のHTML。インタラクティブ性は維持される */}
</Droplets>
```

#### Options (17)

| prop | type | 説明 |
|---|---|---|
| `intensity` | `number` | How much rain falls, from a light drizzle to a downpour (0 to 1.25). |
| `speed` | `number` | Animation speed multiplier. |
| `scale` | `number` | Size of the droplet pattern. Higher means smaller drops. |
| `dropWidth` | `number` | Width of the droplets and their trails. |
| `dropLength` | `number` | How elongated the falling droplets are. |
| `refraction` | `number` | How strongly droplets refract the content behind them. |
| `blur` | `number` | Background blur outside the droplets, like a fogged up window. |
| `vignette` | `number` | Darkens the edges of the canvas (0 to 1). |
| `fallSpeed` | `number` | How fast the running drops slide down. |
| `wiggle` | `number` | Horizontal wiggle of the running drops. |
| `staticDrops` | `number` | Multiplier for the small static droplets. |
| `interactive` | `boolean` | Wipe drops off the glass with the pointer. |
| `interactionRadius` | `number` | Radius of the cursor wipe, relative to the screen height. |
| `interactionStrength` | `number` | How strongly the cursor wipes drops off the glass (0 to 1). |
| `interactionDistortion` | `number` | How much the wipe distorts the content behind it. |
| `tint` | `[number, number, number]` | Tint color layered over the content as [r, g, b] in 0-1 range. |
| `tintStrength` | `number` | Strength of the tint (0 to 1). |

### Frost

- **slug**: `frost` / **install**: `npx shadcn@latest add @canvas-ui/frost-react`
- **種別**: Wrapper（children を包む・html-in-canvas 必須）
- **docs**: https://canvasui.dev/docs/components/frost

Covers your page in a frozen pane of ice with refraction and frost grain. Hovering melts a hole through the frost, which freezes back over. The HTML stays interactive. No dependencies.

```tsx
<Frost>
  {/* 通常のHTML。インタラクティブ性は維持される */}
</Frost>
```

#### Options (27)

| prop | type | 説明 |
|---|---|---|
| `frost` | `number` | Base frozen coverage added on top of the frost pattern (0-1). |
| `strength` | `number` | Multiplier on the frost noise pattern. Higher freezes more of the pane. |
| `contrast` | `number` | Contrast of the frost noise pattern. |
| `crispness` | `number` | Contrast of the final frost mask. Higher gives crisper frost edges. |
| `highlight` | `number` | How much sparkling highlight grain mixes into the frost (0-1). |
| `highlightStrength` | `number` | How strongly highlights tint toward white (0-1). |
| `haze` | `number` | Base blur haze mixed over the content, even outside thick frost (0-1). |
| `tintThin` | `[number, number, number]` | Frost color where the layer is thin, as [r, g, b] in 0-1 range. |
| `tintThick` | `[number, number, number]` | Frost color where the layer is thick, as [r, g, b] in 0-1 range. |
| `tintStrength` | `number` | How much the frost tint colors the frozen areas (0-1). |
| `saturation` | `number` | Saturation multiplier applied to the frosted content. |
| `brightness` | `number` | Brightness multiplier applied to the frosted content. |
| `refraction` | `number` | How far the icy surface bends light. 0 disables refraction. |
| `ior` | `number` | Index of refraction of the ice. Water ice is about 1.31. |
| `detail` | `number` | Strength of the fine surface detail in the refraction. |
| `textureScale` | `number` | Scale of the icy relief pattern. Higher is larger features. |
| `fresnel` | `number` | Fresnel boost at grazing angles (0-2). |
| `meltRadius` | `number` | Radius of the melt spot under the cursor (0-1, fraction of height). |
| `meltNoise` | `number` | Irregularity of the melt edge. 0 is a clean circle. |
| `meltStrength` | `number` | How quickly hovering melts the frost (0-1). |
| `refreeze` | `number` | How fast melted areas freeze back over. 0 never refreezes. |
| `edgeFade` | `number` | Keeps the edges of the pane frozen. 0 lets everything melt. |
| `meltEdges` | `boolean` | Lets the frozen borders of the pane melt too. |
| `introDuration` | `number` | Seconds for the frost to grow in from the edges on load. 0 disables. |
| `opacity` | `number` | Overall opacity of the frost layer (0-1). Lower shows more content. |
| `shimmer` | `number` | Animated twinkle of the highlight grain (0-1). 0 is static. |
| `quality` | `number` | Resolution multiplier for the blur passes (0.25-1). |

### Glass

- **slug**: `glass` / **install**: `npx shadcn@latest add @canvas-ui/glass-react`
- **種別**: Wrapper（children を包む・html-in-canvas 必須）
- **docs**: https://canvasui.dev/docs/components/glass

A cursor-following glass lens that refracts your page like real glass, with a crystal ball zoom over target elements. The HTML stays interactive. No dependencies.

```tsx
<Glass>
  {/* 通常のHTML。インタラクティブ性は維持される */}
</Glass>
```

#### Options (15)

| prop | type | 説明 |
|---|---|---|
| `shape` | `"circle" \| "square" \| "rectangle"` | Lens shape. |
| `size` | `number` | Lens size (radius, or half height for rectangles) in CSS pixels. |
| `aspect` | `number` | Width to height ratio of the rectangle shape (1 to 3). |
| `corner` | `number` | Corner radius for square and rectangle shapes in CSS pixels. |
| `ior` | `number` | Index of refraction of the glass (1 to 2). Higher bends light more. |
| `edge` | `number` | Fraction of the lens that stays optically flat before the rim (0 to 1). |
| `bevel` | `number` | How sharply the rim curves away (1 to 10). |
| `depth` | `number` | Optical depth in CSS pixels: how far the glass floats above the page. |
| `aberration` | `number` | Chromatic aberration strength at the rim (0 to 3). 0 disables it. |
| `blur` | `number` | Frosted blur of the glass face (0 = optically clear, up to 4). |
| `reflection` | `number` | Strength of the fresnel reflection on the rim (0 to 2). 0 disables it. |
| `shine` | `number` | Specular rim highlight (0 to 2). Keeps the lens visible even over plain backgrounds where clear glass would otherwise be invisible. 0 disables it. |
| `zoom` | `number` | Magnification while hovering a target element (1 to 3). |
| `targets` | `string` | CSS selector for elements that trigger the crystal ball zoom. |
| `follow` | `number` | How quickly the lens follows the cursor (0 to 1). 1 snaps to it. |

### GlassObject

- **slug**: `glass-object` / **install**: `npx shadcn@latest add @canvas-ui/glass-object-react`
- **種別**: Object（three.js・childrenなし・全ブラウザ動作）
- **docs**: https://canvasui.dev/docs/components/glass-object

Turns any GLB/glTF model, SVG, or image into a floating liquid-glass object with real refraction, chromatic dispersion, frost, and tinted absorption, lit by a studio environment. Built on three.js.

```tsx
<GlassObject src="/models/your-asset.glb" />
```

#### Options (29)

| prop | type | 説明 |
|---|---|---|
| `src` | `string` | URL of the asset to display: GLB/glTF, SVG, PNG, JPEG, WebP, or GIF. Object URLs from a file input work too. The format is sniffed from the bytes, not the extension. |
| `ior` | `number` | Index of refraction of the glass (1 to 2.33). |
| `thickness` | `number` | Thickness of the glass volume in scene units. Drives how strongly light bends. |
| `roughness` | `number` | Surface roughness (0 to 1). Higher values frost the glass. |
| `dispersion` | `number` | Chromatic dispersion of the refraction (0 to 2). Splits light into rainbow fringes like real glass. |
| `clearcoat` | `number` | Clearcoat layer on top of the glass (0 to 1). |
| `tint` | `string` | Tint color of the glass volume as any CSS color. Empty string keeps the glass clear. |
| `tintDensity` | `number` | How strongly the tint absorbs light through the volume. |
| `depth` | `number` | Extrusion depth of 2D assets (SVG or image) as a fraction of their longest side. |
| `bevel` | `number` | Edge rounding of extruded 2D assets (0 to 1). Higher values melt the edges into a liquid lip. |
| `highlight` | `string` | Accent color of the ring light in the studio environment. |
| `environmentIntensity` | `number` | Brightness of the studio environment lighting. |
| `background` | `string` | Background color behind the glass. Empty string keeps the canvas transparent. |
| `backgroundImage` | `string` | URL of an image shown as a backdrop behind the glass, cover-fit to the view. The glass samples and refracts it. Empty string disables the backdrop. |
| `scale` | `number` | Size of the longest side of the asset in scene units. The camera sits about 4 units away. |
| `xOffset` | `number` | Horizontal offset of the asset in scene units. |
| `yOffset` | `number` | Vertical offset of the asset in scene units. |
| `floatIntensity` | `number` | Strength of the floating bob animation (0 disables). |
| `rotationIntensity` | `number` | Strength of the idle rocking rotation (0 disables). |
| `floatSpeed` | `number` | Speed of the float and rocking animation. |
| `orbit` | `boolean` | Let the user orbit the camera by dragging. |
| `zoom` | `boolean` | Let the user zoom with the scroll wheel or pinch. |
| `autoRotate` | `boolean` | Spin the camera around the asset turntable-style. |
| `autoRotateSpeed` | `number` | Turntable speed when autoRotate is on. |
| `fov` | `number` | Camera field of view in degrees. |
| `cameraDistance` | `number` | Camera distance from the center of the asset. |
| `dracoDecoderPath` | `string` | Base URL of the Draco decoder, fetched only when a model needs it. |
| `onLoad` | `(() => void) \| null` | Called after an asset finishes loading. |
| `onError` | `((error: unknown) => void) \| null` | Called when an asset fails to load. |

### Glitch

- **slug**: `glitch` / **install**: `npx shadcn@latest add @canvas-ui/glitch-react`
- **種別**: Wrapper（children を包む・html-in-canvas 必須）
- **docs**: https://canvasui.dev/docs/components/glitch

Broadcast glitch bursts that tear the page into shifted slices with RGB splits, corrupted blocks, and analog noise, then settle back to a clean read. The HTML stays interactive. No dependencies.

```tsx
<Glitch>
  {/* 通常のHTML。インタラクティブ性は維持される */}
</Glitch>
```

#### Options (8)

| prop | type | 説明 |
|---|---|---|
| `intensity` | `number` | Overall strength of the glitch (0 to 2). |
| `interval` | `number` | Seconds between glitch bursts. 0 keeps the glitch running constantly. |
| `duration` | `number` | How long each burst lasts in seconds. |
| `slices` | `number` | Number of horizontal slices the tear snaps to. Lower is chunkier. |
| `shift` | `number` | How far the torn slices shift sideways, in CSS pixels. |
| `rgbShift` | `number` | Chromatic RGB split during bursts, in CSS pixels. |
| `blocks` | `number` | Amount of corrupted block artifacts during bursts (0 to 1). |
| `noise` | `number` | Analog noise and scanline flicker during bursts (0 to 1). |

### Grid

- **slug**: `grid` / **install**: `npx shadcn@latest add @canvas-ui/grid-react`
- **種別**: Wrapper（children を包む・html-in-canvas 必須）
- **docs**: https://canvasui.dev/docs/components/grid

Splits your page into a grid of 3D tiles that ripple in waves around the cursor. The HTML stays interactive. No dependencies.

```tsx
<Grid>
  {/* 通常のHTML。インタラクティブ性は維持される */}
</Grid>
```

#### Options (17)

| prop | type | 説明 |
|---|---|---|
| `tileSize` | `number` | Size of each grid tile in CSS pixels. |
| `gap` | `number` | Gap between tiles in CSS pixels. |
| `cornerRadius` | `number` | Corner radius of each tile in CSS pixels. |
| `amplitude` | `number` | Overall strength of the wave displacement. |
| `waveSpeed` | `number` | How fast the wavefront expands, in screen heights per second. |
| `frequency` | `number` | Spatial oscillation of the wave. Higher means more ripples per wave. |
| `waveWidth` | `number` | Width of the wave ring as a fraction of the screen height. |
| `fadeTime` | `number` | Seconds for a wave to fade to roughly a third of its strength. |
| `maxLift` | `number` | Maximum lift a tile can reach (0 to 1). |
| `jitter` | `number` | Per-tile randomness in how tiles respond to the wave (0 to 1). |
| `liftHeight` | `number` | How high a fully lifted cube rises, in CSS pixels. |
| `perspective` | `number` | Camera distance in CSS pixels, like CSS perspective. Lower is more dramatic. |
| `tilt` | `number` | How much the camera vanishing point leans toward the cursor (0 to 1). |
| `shading` | `number` | Strength of the lighting on cube tops and side walls. |
| `tint` | `[number, number, number]` | Color lifted tiles blend toward as [r, g, b] in 0-1 range. |
| `tintStrength` | `number` | How strongly lifted tiles take on the tint color (0 to 1). |
| `idleRipples` | `number` | Seconds between ambient ripples when the cursor is idle. 0 disables. |

### HexFloat

- **slug**: `hex-float` / **install**: `npx shadcn@latest add @canvas-ui/hex-float-react`
- **種別**: Wrapper（children を包む・html-in-canvas 必須）
- **docs**: https://canvasui.dev/docs/components/hex-float

Renders the live page onto a floor of shiny beveled hex tiles that lean back in perspective, bob gently, and rise toward the cursor. The HTML stays interactive. No dependencies.

```tsx
<HexFloat>
  {/* 通常のHTML。インタラクティブ性は維持される */}
</HexFloat>
```

#### Options (17)

| prop | type | 説明 |
|---|---|---|
| `size` | `number` | Width of each hex tile in CSS pixels. |
| `gap` | `number` | Seam between tiles in CSS pixels. |
| `bevel` | `number` | Width of the shiny beveled rim in CSS pixels. |
| `tilt` | `number` | Backward lean of the page in degrees (-30 to 30). Positive tilts the top away. |
| `perspective` | `number` | Camera closeness (0 to 1). Higher exaggerates the perspective of the tilt. |
| `float` | `number` | How far tiles bob up and down as they float (0 to 1). 0 keeps them still. |
| `speed` | `number` | Speed of the floating motion. 1 is normal speed. |
| `shine` | `number` | Intensity of the specular glints on rims and tile faces (0 to 2). |
| `lift` | `number` | How strongly tiles rise along the edges of the fluid reading window (0 to 1). |
| `radius` | `number` | Size of the fluid splats the cursor injects, in CSS pixels. Sets the reading window's scale. |
| `flow` | `number` | How strongly cursor movement pushes the fluid around (0 to 3). |
| `swirl` | `number` | Vorticity of the fluid (0 to 15). Higher makes the window's trail curl into eddies. |
| `trail` | `number` | How long the fluid trail lingers before healing (0 to 1). |
| `iridescence` | `number` | Strength of the iridescent hue shift on highlights (0 to 2). 0 keeps highlights neutral. |
| `bloom` | `number` | Bloom glow around bright highlights (0 to 1). 0 skips the pass entirely. |
| `grain` | `number` | Animated film grain over the final image (0 to 1). 0 skips the pass entirely. |
| `gapColor` | `[number, number, number] \| "auto"` | Seam color as [r, g, b] in 0-1 range, or "auto" to derive a dark seam from the page background. |

### Laser

- **slug**: `laser` / **install**: `npx shadcn@latest add @canvas-ui/laser-react`
- **種別**: Wrapper（children を包む・html-in-canvas 必須）
- **docs**: https://canvasui.dev/docs/components/laser

Hides everything below a glowing laser beam near the bottom of the viewport. Scrolling prints new content in from behind it. The HTML stays interactive. No dependencies.

```tsx
<Laser>
  {/* 通常のHTML。インタラクティブ性は維持される */}
</Laser>
```

#### Options (15)

| prop | type | 説明 |
|---|---|---|
| `speed` | `number` | Animation speed of the beam wave, flicker, and sparkle. 1 is normal. |
| `offset` | `number` | Distance of the beam from the bottom edge in CSS pixels. |
| `color` | `[number, number, number]` | Laser glow color as RGB in the 0 to 1 range. |
| `thickness` | `number` | Thickness of the white-hot beam core in CSS pixels. |
| `core` | `number` | Intensity of the white beam core (0 to 2). 0 removes it. |
| `radius` | `number` | Reach of the colored glow around the beam in CSS pixels. |
| `glow` | `number` | Brightness of the colored glow (0 to 3). 0 removes it. |
| `wave` | `number` | Amplitude of the slow beam waviness in CSS pixels. |
| `width` | `number` | Beam length as a fraction of the content width (0 to 1). |
| `flicker` | `number` | Random intensity flicker of the beam (0 to 1). |
| `reveal` | `number` | Height of the hot reveal band above the beam in CSS pixels. |
| `heat` | `number` | How strongly freshly revealed content glows (0 to 1.5). |
| `shimmer` | `number` | Heat shimmer displacement of freshly revealed content in CSS pixels. |
| `sparkle` | `number` | Animated sparkle texture inside the reveal band (0 to 2). |
| `reactivity` | `number` | How much scrolling boosts the beam and the reveal glow (0 to 3). |

### Liquid

- **slug**: `liquid` / **install**: `npx shadcn@latest add @canvas-ui/liquid-react`
- **種別**: Wrapper（children を包む・html-in-canvas 必須）
- **docs**: https://canvasui.dev/docs/components/liquid

A pointer-driven WebGL fluid simulation over your page. The HTML stays interactive. No dependencies.

```tsx
<Liquid>
  {/* 通常のHTML。インタラクティブ性は維持される */}
</Liquid>
```

#### Options (14)

| prop | type | 説明 |
|---|---|---|
| `simResolution` | `number` | Resolution of the simulation grid. |
| `dyeResolution` | `number` | Resolution of the fluid trail texture. |
| `densityDissipation` | `number` | How much the trail persists each frame (closer to 1 lasts longer). |
| `velocityDissipation` | `number` | How much motion persists each frame (closer to 1 lasts longer). |
| `pressure` | `number` | How much pressure carries over between frames. |
| `pressureIterations` | `number` | Pressure solver iterations. |
| `curl` | `number` | Rotational force added back into the flow. |
| `radius` | `number` | Radius of the pointer splat. |
| `force` | `number` | Force multiplier applied on pointer movement. |
| `intensity` | `number` | Strength of the color tint left by the flow. |
| `distortion` | `number` | How strongly the flow warps the content. |
| `blend` | `number` | How much of the fluid color blends over the content. |
| `color` | `[number, number, number]` | Trail color as [r, g, b] in 0-1 range. Ignored when rainbow is on. |
| `rainbow` | `boolean` | Color the trail from the flow direction instead of a fixed color. |

### Magnify

- **slug**: `magnify` / **install**: `npx shadcn@latest add @canvas-ui/magnify-react`
- **種別**: Wrapper（children を包む・html-in-canvas 必須）
- **docs**: https://canvasui.dev/docs/components/magnify

A sci-fi scanner lens that follows the cursor and magnifies the live page inside a configurable HUD reticle, with chromatic aberration haze and click ripples that bend the page. The HTML stays interactive. No dependencies.

```tsx
<Magnify>
  {/* 通常のHTML。インタラクティブ性は維持される */}
</Magnify>
```

#### Options (21)

| prop | type | 説明 |
|---|---|---|
| `size` | `number` | Lens radius in CSS pixels. |
| `zoom` | `number` | Magnification inside the lens (1 to 4). |
| `color` | `[number, number, number]` | HUD accent color as RGB in the 0 to 1 range. Tints the reticle, readout, and ripple outline. |
| `follow` | `number` | How quickly the lens follows the cursor (0 to 1). 1 snaps to it. |
| `hud` | `number` | Overall HUD intensity (0 to 1). 0 hides every reticle element. |
| `ring` | `boolean` | Show the outer ring. |
| `crosshair` | `boolean` | Show the crosshair lines through the center. |
| `ticks` | `boolean` | Show the tick marks around the ring. |
| `brackets` | `boolean` | Show the corner brackets inside the lens. |
| `dot` | `boolean` | Show the center dot. |
| `grid` | `boolean` | Show a faint measurement grid inside the lens. |
| `readout` | `boolean` | Show the data readout beside the lens. |
| `aberration` | `number` | Chromatic aberration split inside the lens (0 to 3). 0 disables it. |
| `haze` | `number` | Dreamy insight haze inside the lens (0 to 1). Softens and lifts the magnified content. |
| `ripples` | `boolean` | Emit a ripple across the page on click. |
| `rippleSpeed` | `number` | How fast the ripple wavefront travels, in CSS pixels per second. |
| `rippleWidth` | `number` | Thickness of the colored ripple outline in CSS pixels. |
| `rippleBendWidth` | `number` | Width of the band the ripple bends, in CSS pixels. |
| `rippleBend` | `number` | How many CSS pixels the ripple bends the page. |
| `rippleGlow` | `number` | Strength of the colored ripple outline (0 to 2). 0 hides it. |
| `rippleLife` | `number` | Seconds a ripple lives before it fades out. |

### ParticleObject

- **slug**: `particle-object` / **install**: `npx shadcn@latest add @canvas-ui/particle-object-react`
- **種別**: Object（three.js・childrenなし・全ブラウザ動作）
- **docs**: https://canvasui.dev/docs/components/particle-object

Rebuilds any GLB/glTF model, SVG, or image as a cloud of particles that the cursor pushes, swirls, and springs back into shape. Built on three.js.

```tsx
<ParticleObject src="/models/your-asset.glb" />
```

#### Options (27)

| prop | type | 説明 |
|---|---|---|
| `src` | `string` | URL of the asset to display: GLB/glTF, SVG, PNG, JPEG, WebP, or GIF. Object URLs from a file input work too. The format is sniffed from the bytes, not the extension. |
| `count` | `number` | Number of particles the asset is rebuilt from. |
| `size` | `number` | Particle size in CSS pixels at the model's distance. |
| `sizeVariance` | `number` | Random per-particle size variation (0 to 1). |
| `color` | `string` | Override color as any CSS color. Empty string keeps the asset's own colors. |
| `radius` | `number` | Radius of the cursor's push field in CSS pixels. |
| `strength` | `number` | How hard the cursor pushes particles away. |
| `swirl` | `number` | Tangential curl of the push (0 to 2). Particles spiral around the cursor instead of only fleeing it. |
| `spring` | `number` | How quickly displaced particles spring back home. |
| `damping` | `number` | Velocity damping (0 to 1). Lower values keep particles wobbling longer. |
| `drift` | `number` | Idle shimmer of the resting particles (0 disables). |
| `background` | `string` | Background color behind the particles. Empty string keeps the canvas transparent. |
| `scale` | `number` | Size of the longest side of the asset in scene units. The camera sits about 4 units away. |
| `xOffset` | `number` | Horizontal offset of the asset in scene units. |
| `yOffset` | `number` | Vertical offset of the asset in scene units. |
| `floatIntensity` | `number` | Strength of the floating bob animation (0 disables). |
| `rotationIntensity` | `number` | Strength of the idle rocking rotation (0 disables). |
| `floatSpeed` | `number` | Speed of the float and rocking animation. |
| `orbit` | `boolean` | Let the user orbit the camera by dragging. |
| `zoom` | `boolean` | Let the user zoom with the scroll wheel or pinch. |
| `autoRotate` | `boolean` | Spin the camera around the asset turntable-style. |
| `autoRotateSpeed` | `number` | Turntable speed when autoRotate is on. |
| `fov` | `number` | Camera field of view in degrees. |
| `cameraDistance` | `number` | Camera distance from the center of the asset. |
| `dracoDecoderPath` | `string` | Base URL of the Draco decoder, fetched only when a model needs it. |
| `onLoad` | `(() => void) \| null` | Called after an asset finishes loading. |
| `onError` | `((error: unknown) => void) \| null` | Called when an asset fails to load. |

### ParticleReveal

- **slug**: `particle-reveal` / **install**: `npx shadcn@latest add @canvas-ui/particle-reveal-react`
- **種別**: Wrapper（children を包む・html-in-canvas 必須）
- **docs**: https://canvasui.dev/docs/components/particle-reveal

Renders your page as fine grayscale dust that merges back into crisp UI around the cursor. The HTML stays interactive. No dependencies.

```tsx
<ParticleReveal>
  {/* 通常のHTML。インタラクティブ性は維持される */}
</ParticleReveal>
```

#### Options (11)

| prop | type | 説明 |
|---|---|---|
| `radius` | `number` | Reveal radius around the cursor in CSS pixels. |
| `softness` | `number` | Feather of the reveal edge as a fraction of the radius (0 to 1). |
| `size` | `number` | Particle grain size in CSS pixels. |
| `scatter` | `number` | How far grains wander from their home pixel in CSS pixels. Bright content spawns the farthest specks. |
| `drift` | `number` | Speed of the idle grain shimmer (0 freezes the dust). |
| `aberration` | `number` | Chromatic aberration strength at the reveal edge in CSS pixels. |
| `bend` | `number` | How strongly unrevealed content smears around the reveal edge in CSS pixels. |
| `fade` | `number` | How strongly dust specks stand out from the background (0 to 1). |
| `threshold` | `number` | Contrast against the background above which a pixel counts as UI and dissolves into dust. Pixels close to the background color are left untouched. |
| `background` | `string` | Color of the backdrop behind the content, as any CSS color. Used to tell UI pixels apart from empty space. |
| `smoothing` | `number` | Seconds the reveal takes to catch up with the cursor. Higher feels more damped. |

### ParticleScroll

- **slug**: `particle-scroll` / **install**: `npx shadcn@latest add @canvas-ui/particle-scroll-react`
- **種別**: Wrapper（children を包む・html-in-canvas 必須）
- **docs**: https://canvasui.dev/docs/components/particle-scroll

Dissolves everything below a chosen line into drifting sand that reassembles as you scroll. The HTML stays interactive. No dependencies.

```tsx
<ParticleScroll>
  {/* 通常のHTML。インタラクティブ性は維持される */}
</ParticleScroll>
```

#### Options (12)

| prop | type | 説明 |
|---|---|---|
| `point` | `number` | Viewport fraction of the formation line. Content assembles as it scrolls up past this line and dissolves back below it. |
| `band` | `number` | Height in CSS pixels of the transition band where particles progressively reassemble. |
| `density` | `number` | Grain spacing in CSS pixels. Smaller values mean finer, denser sand. |
| `size` | `number` | Size of fully scattered dust grains in CSS pixels. Grains grow to cover their cell as they land. |
| `spread` | `number` | Maximum distance in CSS pixels particles scatter from their home position. |
| `gravity` | `number` | Downward bias of the scattered cloud (-1 to 1), like sand settling. Negative values lift it. |
| `drift` | `number` | Idle float speed of scattered particles (0 to 1). 0 freezes the cloud. |
| `swirl` | `number` | Sideways arc in CSS pixels particles take while flying home. |
| `stagger` | `number` | Per-particle randomness of reassembly timing (0 to 1). |
| `fade` | `number` | Opacity of fully scattered particles (0 to 1). |
| `settle` | `number` | Seconds a row of dust takes to condense into the page once the reveal reaches it. |
| `smoothing` | `number` | Seconds the damped scroll takes to catch up with the real scroll. Higher feels more fluid. |

### Peel

- **slug**: `peel` / **install**: `npx shadcn@latest add @canvas-ui/peel-react`
- **種別**: Wrapper（children を包む・html-in-canvas 必須）
- **docs**: https://canvasui.dev/docs/components/peel

Peels your page back from a chosen edge as the cursor approaches, revealing a second layer underneath. The HTML stays interactive. No dependencies.

```tsx
<Peel>
  {/* 通常のHTML。インタラクティブ性は維持される */}
</Peel>
```

#### Options (13)

| prop | type | 説明 |
|---|---|---|
| `side` | `PeelSide` | Edge the content peels from. |
| `mode` | `PeelMode` | How the peel is driven. "cursor" peels progressively as the pointer nears the edge, "hover" peels fully when the pointer enters the zone. |
| `reveal` | `number` | How many CSS pixels of the under layer are exposed at full peel. |
| `zone` | `number` | Width of the strip along the chosen edge that drives the peel, in CSS pixels. |
| `curl` | `number` | Radius of the curl in CSS pixels. Smaller values fold sharper. |
| `bow` | `number` | Extra lift at the middle of the peeling edge in CSS pixels. Negative values bow the sheet inwards. |
| `shade` | `number` | Strength of the curl shading on the lifted sheet (0 to 1). |
| `shine` | `number` | Strength of the shine along the peeling edge that follows the cursor (0 to 1). |
| `shineDistance` | `number` | Distance from the edge at which the shine starts to appear, in CSS pixels. 0 uses the full container span. |
| `shineColor` | `[number, number, number] \| "auto"` | Shine color as RGB in the 0 to 1 range, or "auto" to follow the page theme: light shine on dark backgrounds, dark shine on light ones. Re-resolves on theme changes. |
| `bulge` | `number` | How many CSS pixels the peeled edge bulges toward the cursor. |
| `perspective` | `number` | Perspective focal length in CSS pixels. Lower values exaggerate the 3D depth. |
| `smoothing` | `number` | Seconds the peel takes to settle. Higher feels more damped. |

### RetroDither

- **slug**: `retro-dither` / **install**: `npx shadcn@latest add @canvas-ui/retro-dither-react`
- **種別**: Wrapper（children を包む・html-in-canvas 必須）
- **docs**: https://canvasui.dev/docs/components/retro-dither

A retro dither lens that pixelates and quantizes your page around the cursor. The HTML stays interactive. No dependencies.

```tsx
<RetroDither>
  {/* 通常のHTML。インタラクティブ性は維持される */}
</RetroDither>
```

#### Options (14)

| prop | type | 説明 |
|---|---|---|
| `radius` | `number` | Radius of the dither lens around the cursor, relative to the screen height. |
| `softness` | `number` | Edge feather of the lens as a fraction of the radius (0 to 1). |
| `pixelSize` | `number` | Size of the retro pixels in CSS pixels. |
| `levels` | `number` | Number of brightness levels the dither quantizes to. |
| `darkColor` | `[number, number, number]` | Dark end of the palette as [r, g, b] in 0-1 range. |
| `lightColor` | `[number, number, number]` | Light end of the palette as [r, g, b] in 0-1 range. |
| `colorize` | `number` | Blend from the content's own colors (0) to the palette (1). |
| `contrast` | `number` | Contrast applied to brightness before dithering. |
| `brightness` | `number` | Brightness offset applied before dithering (-1 to 1). |
| `strength` | `number` | Coverage of the dithered pixels inside the lens (0 to 1). |
| `baseStrength` | `number` | Dither coverage across the whole screen, outside the lens (0 to 1). |
| `invert` | `number` | Invert brightness inside the effect (0 to 1). |
| `scanlines` | `number` | Intensity of the retro scanline overlay (0 to 1). |
| `followSpeed` | `number` | How quickly the lens follows the cursor. Higher is snappier. |

### Ripple

- **slug**: `ripple` / **install**: `npx shadcn@latest add @canvas-ui/ripple-react`
- **種別**: Wrapper（children を包む・html-in-canvas 必須）
- **docs**: https://canvasui.dev/docs/components/ripple

Water ripples that spread from every click and refract the live page like a pond surface, with dispersion and light glints on the crests. The HTML stays interactive. No dependencies.

```tsx
<Ripple>
  {/* 通常のHTML。インタラクティブ性は維持される */}
</Ripple>
```

#### Options (10)

| prop | type | 説明 |
|---|---|---|
| `amplitude` | `number` | Height of the waves (0 to 3). |
| `speed` | `number` | How fast the rings travel outward. 1 is normal speed. |
| `wavelength` | `number` | Distance between wave crests in CSS pixels. |
| `rings` | `number` | Number of crests in each wave train (1 to 8). |
| `decay` | `number` | How quickly the waves lose energy (higher dies faster). |
| `refraction` | `number` | How strongly the waves bend the page content, in CSS pixels. |
| `dispersion` | `number` | Chromatic dispersion splitting colors along the wave slopes (0 to 1). |
| `shine` | `number` | Intensity of the light glints on the wave crests (0 to 2). |
| `trigger` | `RippleTrigger` | What spawns ripples. "click" on press, "hover" also leaves a wake while moving, "none" only ambient. |
| `interval` | `number` | Seconds between ambient ripples at random positions. 0 disables them. |

### Shatter

- **slug**: `shatter` / **install**: `npx shadcn@latest add @canvas-ui/shatter-react`
- **種別**: Wrapper（children を包む・html-in-canvas 必須）
- **docs**: https://canvasui.dev/docs/components/shatter

Shatters your page into 3D glass shards that lift, tilt, and float around the cursor, refracting the content beneath them, with perspective and soft shadows. The HTML stays interactive. No dependencies.

```tsx
<Shatter>
  {/* 通常のHTML。インタラクティブ性は維持される */}
</Shatter>
```

#### Options (18)

| prop | type | 説明 |
|---|---|---|
| `radius` | `number` | Radius of the shatter lens around the cursor, relative to the screen height. |
| `softness` | `number` | Edge feather of the lens as a fraction of the radius (0 to 1). |
| `tileSize` | `number` | Tile size in CSS pixels. |
| `shards` | `number` | Shape irregularity. 0 keeps a perfect square grid, 1 breaks the page into uneven glass shards. |
| `corner` | `number` | Corner rounding of fully lifted tiles in CSS pixels. |
| `lift` | `number` | How high tiles lift off the page in CSS pixels. |
| `tilt` | `number` | How steeply tiles tip out of the page plane (0 to 3). |
| `scatter` | `number` | How far tiles slide sideways while lifted, in CSS pixels. |
| `perspective` | `number` | Perspective distance in CSS pixels. Lower is more dramatic. |
| `gapColor` | `[number, number, number]` | Color of the void behind lifted tiles as [r, g, b] in 0-1 range. |
| `shadow` | `number` | Opacity of the drop shadows under lifted tiles (0 to 2). |
| `shading` | `number` | Strength of the per-tile lighting (0 to 2). |
| `refraction` | `number` | How strongly lifted shards refract the content beneath them, like glass (0 to 2). |
| `dispersion` | `number` | Chromatic fringing of the refraction (0 to 1). 0 keeps it color-true. |
| `floatSpeed` | `number` | Speed of the floating tile motion. 0 freezes the tiles. |
| `strength` | `number` | How fully tiles lift inside the lens (0 to 1). |
| `baseStrength` | `number` | Lift amount across the whole screen, outside the lens (0 to 1). |
| `followSpeed` | `number` | How quickly the lens follows the cursor. Higher is snappier. |

### VHS

- **slug**: `vhs` / **install**: `npx shadcn@latest add @canvas-ui/vhs-react`
- **種別**: Wrapper（children を包む・html-in-canvas 必須）
- **docs**: https://canvasui.dev/docs/components/vhs

Plays your page back like a worn VHS tape, with tape wave, head-switch noise, chroma bleed, and grain. The HTML stays interactive. No dependencies.

```tsx
<VHS>
  {/* 通常のHTML。インタラクティブ性は維持される */}
</VHS>
```

#### Options (15)

| prop | type | 説明 |
|---|---|---|
| `speed` | `number` | Playback speed of the tape artifacts. 1 is normal speed. |
| `wave` | `number` | Strength of the slow horizontal tape wave (0 to 3). |
| `jitter` | `number` | Strength of the fine per-line horizontal jitter (0 to 3). |
| `crease` | `number` | Strength of the travelling tape crease band (0 to 3). |
| `switching` | `number` | Strength of the head-switching noise at the bottom (0 to 3). |
| `switchingHeight` | `number` | Height of the head-switching band as a fraction of the screen. |
| `bloom` | `number` | Strength of the horizontal glow bleed (0 to 1). |
| `aberration` | `number` | RGB channel misalignment in CSS pixels. |
| `acBeat` | `number` | Strength of the slow brightness beat rolling down the frame (0 to 1). |
| `grain` | `number` | Amount of animated static grain (0 to 1). |
| `scanlines` | `number` | Intensity of the CRT scanline overlay (0 to 1). |
| `vignette` | `number` | Darkening toward the frame corners (0 to 1). |
| `barrel` | `number` | CRT tube curvature bending the frame inward (0 to 1). 0 disables. |
| `saturation` | `number` | Color saturation. 1 keeps the content's colors, 0 is grayscale. |
| `exposure` | `number` | Extra brightness multiplier applied at the end. |
