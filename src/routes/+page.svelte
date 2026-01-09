<script lang="ts">
import { LiquidGlass, GlassMode } from '$lib/index.js';
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-neutral-900 p-10 gap-8">
  <div class="text-white text-3xl font-bold mb-4">Liquid Glass Svelte Demo</div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
    <LiquidGlass
      onClick={() => console.log('Clicked!')}
      displacementScale={70}
      className="cursor-pointer"
    >
      Click Me
    </LiquidGlass>

    <LiquidGlass
        mode={GlassMode.polar}
        padding="20px 40px"
    >
        Polar Effect
    </LiquidGlass>

    <LiquidGlass
        mode={GlassMode.prominent}
        overLight={true}
    >
        Prominent Light
    </LiquidGlass>

    <LiquidGlass
        mode={GlassMode.shader}
        effect="liquidGlass"
    >
        Shader Liquid
    </LiquidGlass>

     <LiquidGlass
        mode={GlassMode.shader}
        effect="transparentIce"
        displacementScale={20}
    >
        Shader Ice
    </LiquidGlass>
  </div>
</div>
