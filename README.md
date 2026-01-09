# Liquid Glass Svelte

Apple's Liquid Glass effect for Svelte 5. Based on the original [liquid-glass-react](https://github.com/shuding/liquid-glass) and [liquid-glass-vue](https://github.com/wxperia/liquid-glass-vue) library.

## Installation

```bash
npm install @keshav-writes-code/liquid-glass-svelte
# or
pnpm add @keshav-writes-code/liquid-glass-svelte
# or
yarn add @keshav-writes-code/liquid-glass-svelte
```

## Usage

```svelte
<script>
  import { LiquidGlass, GlassMode } from '@keshav-writes-code/liquid-glass-svelte';
</script>

<!-- Basic Usage -->
<LiquidGlass onClick={() => console.log('Clicked')}>
  Click Me
</LiquidGlass>

<!-- Polar Mode -->
<LiquidGlass mode={GlassMode.polar}>
  Polar Effect
</LiquidGlass>

<!-- Shader Mode (Ice Effect) -->
<LiquidGlass
  mode={GlassMode.shader}
  effect="transparentIce"
  displacementScale={20}
>
  Ice
</LiquidGlass>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `displacementScale` | `number` | `70` | Scale of the displacement effect |
| `blurAmount` | `number` | `0.0625` | Amount of blur applied |
| `saturation` | `number` | `140` | Saturation level |
| `aberrationIntensity` | `number` | `2` | Intensity of chromatic aberration |
| `elasticity` | `number` | `0.15` | Elasticity of the movement |
| `cornerRadius` | `number` | `999` | Corner radius of the container |
| `padding` | `string` | `"24px 32px"` | Padding inside the glass container |
| `overLight` | `boolean` | `false` | Enable over-light effect |
| `mode` | `GlassMode` | `standard` | Mode of operation: `standard`, `polar`, `prominent`, `shader` |
| `effect` | `string` | `"liquidGlass"` | Shader effect name (only for `mode="shader"`) |
| `onClick` | `() => void` | `undefined` | Click handler |

### Shader Effects

When `mode` is set to `GlassMode.shader`, you can use the following `effect` values:
- `liquidGlass`
- `liquidGlass2`
- `flowingLiquid`
- `transparentIce`
- `unevenGlass`
- `mosaicGlass`

## License

MIT
