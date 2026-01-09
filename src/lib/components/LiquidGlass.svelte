<script lang="ts">
import { type LiquidGlassProps, GlassMode } from '../type';
import GlassContainer from './GlassContainer.svelte';
import { autoPx } from '../utils';

let {
  displacementScale = 70,
  blurAmount = 0.0625,
  saturation = 140,
  aberrationIntensity = 2,
  elasticity = 0.15,
  cornerRadius = 999,
  padding = "24px 32px",
  overLight = false,
  mode = GlassMode.standard,
  globalMousePos,
  mouseOffset,
  mouseContainer,
  style = "",
  class: className = "",
  onClick,
  children,
  ...rest
}: LiquidGlassProps = $props();

// Internal state
let isHovered = $state(false);
let isActive = $state(false);
let glassSize = $state({ width: 270, height: 69 });
let internalGlobalMousePos = $state({ x: 0, y: 0 });
let internalMouseOffset = $state({ x: 0, y: 0 });

let glassRef = $state<any>(null); // Component reference

// Derived
let currentGlobalMousePos = $derived(globalMousePos || internalGlobalMousePos);
let currentMouseOffset = $derived(mouseOffset || internalMouseOffset);

const handleMouseMove = (e: MouseEvent) => {
    // Need access to container
    const containerEl = mouseContainer || glassRef?.getElement();
    if (!containerEl) return;

    const rect = containerEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    internalMouseOffset = {
        x: ((e.clientX - centerX) / rect.width) * 100,
        y: ((e.clientY - centerY) / rect.height) * 100,
    };
    internalGlobalMousePos = {
        x: e.clientX,
        y: e.clientY
    };
}

$effect(() => {
    if (globalMousePos && mouseOffset) return;

    const containerEl = mouseContainer || glassRef?.getElement();
    if (!containerEl) return;

    containerEl.addEventListener("mousemove", handleMouseMove);
    return () => {
        containerEl.removeEventListener("mousemove", handleMouseMove);
    }
});

const calculateDirectionalScale = $derived.by(() => {
    if (!currentGlobalMousePos.x || !currentGlobalMousePos.y || !glassRef?.getElement()) {
        return "scale(1)";
    }
    const el = glassRef.getElement();
    const rect = el.getBoundingClientRect();
    const pillCenterX = rect.left + rect.width / 2;
    const pillCenterY = rect.top + rect.height / 2;
    const pillWidth = glassSize.width;
    const pillHeight = glassSize.height;

    const deltaX = currentGlobalMousePos.x - pillCenterX;
    const deltaY = currentGlobalMousePos.y - pillCenterY;

    const edgeDistanceX = Math.max(0, Math.abs(deltaX) - pillWidth / 2);
    const edgeDistanceY = Math.max(0, Math.abs(deltaY) - pillHeight / 2);
    const edgeDistance = Math.sqrt(edgeDistanceX * edgeDistanceX + edgeDistanceY * edgeDistanceY);

    const activationZone = 200;
    if (edgeDistance > activationZone) return "scale(1)";

    const fadeInFactor = 1 - edgeDistance / activationZone;
    const centerDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if (centerDistance === 0) return "scale(1)";

    const normalizedX = deltaX / centerDistance;
    const normalizedY = deltaY / centerDistance;

    const stretchIntensity = Math.min(centerDistance / 300, 1) * elasticity * fadeInFactor;

    const scaleX = 1 + Math.abs(normalizedX) * stretchIntensity * 0.3 - Math.abs(normalizedY) * stretchIntensity * 0.15;
    const scaleY = 1 + Math.abs(normalizedY) * stretchIntensity * 0.3 - Math.abs(normalizedX) * stretchIntensity * 0.15;

    return `scaleX(${Math.max(0.8, scaleX)}) scaleY(${Math.max(0.8, scaleY)})`;
});

const calculateFadeInFactor = $derived.by(() => {
    if (!currentGlobalMousePos.x || !currentGlobalMousePos.y || !glassRef?.getElement()) {
        return 0;
    }
    const el = glassRef.getElement();
    const rect = el.getBoundingClientRect();
    const pillCenterX = rect.left + rect.width / 2;
    const pillCenterY = rect.top + rect.height / 2;
    const pillWidth = glassSize.width;
    const pillHeight = glassSize.height;

    const edgeDistanceX = Math.max(0, Math.abs(currentGlobalMousePos.x - pillCenterX) - pillWidth / 2);
    const edgeDistanceY = Math.max(0, Math.abs(currentGlobalMousePos.y - pillCenterY) - pillHeight / 2);
    const edgeDistance = Math.sqrt(edgeDistanceX * edgeDistanceX + edgeDistanceY * edgeDistanceY);

    const activationZone = 200;
    return edgeDistance > activationZone ? 0 : 1 - edgeDistance / activationZone;
});

const calculateElasticTranslation = $derived.by(() => {
    if (!glassRef?.getElement()) {
        return { x: 0, y: 0 };
    }
    const el = glassRef.getElement();
    const rect = el.getBoundingClientRect();
    const pillCenterX = rect.left + rect.width / 2;
    const pillCenterY = rect.top + rect.height / 2;

    return {
        x: (currentGlobalMousePos.x - pillCenterX) * elasticity * 0.1 * calculateFadeInFactor,
        y: (currentGlobalMousePos.y - pillCenterY) * elasticity * 0.1 * calculateFadeInFactor,
    };
});

// Resize observer or effect
$effect(() => {
    const updateGlassSize = () => {
        if (glassRef?.getElement()) {
            const rect = glassRef.getElement().getBoundingClientRect();
            glassSize = { width: rect.width, height: rect.height };
        }
    };
    updateGlassSize();
    window.addEventListener("resize", updateGlassSize);
    return () => window.removeEventListener("resize", updateGlassSize);
});

let transformStyle = $derived(`translate(${calculateElasticTranslation.x}px, ${calculateElasticTranslation.y}px) ${isActive && onClick ? "scale(0.96)" : calculateDirectionalScale}`);

// Styles
// Note: default positioning is handled by the user or default layout.
// We use a wrapper that applies the transform.
let wrapperStyle = $derived(`
    ${style};
    transform: ${transformStyle};
    transition: all ease-out 0.2s;
`);

</script>

<div class={`liquid-glass-wrapper relative inline-block ${className}`} style={wrapperStyle}>
    <!-- Over light effect -->
    <div
        class={`bg-black transition-all duration-150 ease-in-out pointer-events-none ${overLight ? 'opacity-20' : 'opacity-0'}`}
        style={`
            position: absolute; inset: 0;
            border-radius: ${cornerRadius}px;
        `}></div>
    <div
        class={`bg-black transition-all duration-150 ease-in-out pointer-events-none mix-blend-overlay ${overLight ? 'opacity-100' : 'opacity-0'}`}
        style={`
            position: absolute; inset: 0;
            border-radius: ${cornerRadius}px;
        `}></div>

    <GlassContainer
        bind:this={glassRef}
        {...rest}
        {cornerRadius}
        displacementScale={overLight ? displacementScale * 0.5 : displacementScale}
        {blurAmount}
        {saturation}
        {aberrationIntensity}
        {glassSize}
        {padding}
        mouseOffset={currentMouseOffset}
        onMouseEnter={() => isHovered = true}
        onMouseLeave={() => isHovered = false}
        onMouseDown={() => isActive = true}
        onMouseUp={() => isActive = false}
        active={isActive}
        {overLight}
        {onClick}
        {mode}
    >
        {@render children?.()}
    </GlassContainer>

    <!-- Border layer 1 -->
    <span style={`
        position: absolute; inset: 0;
        border-radius: ${cornerRadius}px;
        pointer-events: none;
        mix-blend-mode: screen;
        opacity: 0.2;
        padding: 1.5px;
        -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        box-shadow: 0 0 0 0.5px rgba(255, 255, 255, 0.5) inset, 0 1px 3px rgba(255, 255, 255, 0.25) inset, 0 1px 4px rgba(0, 0, 0, 0.35);
        background: linear-gradient( ${135 + currentMouseOffset.x * 1.2}deg, rgba(255, 255, 255, 0.0) 0%, rgba(255, 255, 255,${0.12 + Math.abs(currentMouseOffset.x) * 0.008}) ${Math.max(10, 33 + currentMouseOffset.y * 0.3)}%, rgba(255, 255, 255, ${0.4 + Math.abs(currentMouseOffset.x) * 0.012}) ${Math.min(90, 66 + currentMouseOffset.y * 0.4)}%, rgba(255, 255, 255, 0.0) 100% );
    `}></span>

    <!-- Border layer 2 -->
    <span style={`
        position: absolute; inset: 0;
        border-radius: ${cornerRadius}px;
        pointer-events: none;
        mix-blend-mode: overlay;
        padding: 1.5px;
        -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        box-shadow: 0 0 0 0.5px rgba(255, 255, 255, 0.5) inset, 0 1px 3px rgba(255, 255, 255, 0.25) inset, 0 1px 4px rgba(0, 0, 0, 0.35);
        background: linear-gradient( ${135 + currentMouseOffset.x * 1.2}deg, rgba(255, 255, 255, 0.0) 0%, rgba(255, 255, 255, ${0.32 + Math.abs(currentMouseOffset.x) * 0.008}) ${Math.max(10, 33 + currentMouseOffset.y * 0.3)}%, rgba(255, 255, 255, ${0.6 + Math.abs(currentMouseOffset.x) * 0.012}) ${Math.min(90, 66 + currentMouseOffset.y * 0.4)}%, rgba(255, 255, 255, 0.0) 100% );
    `}></span>

    {#if onClick}
        <!-- Hover effects -->
        <div style={`
            position: absolute; inset: 0; width: ${autoPx(glassSize.width + 1)};
            border-radius: ${cornerRadius}px;
            pointer-events: none;
            transition: all 0.2s ease-out;
            opacity: ${isHovered || isActive ? 0.5 : 0};
            background-image: radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 50%);
            mix-blend-mode: overlay;
        `}></div>
        <div style={`
            position: absolute; inset: 0; width: ${autoPx(glassSize.width + 1)};
            border-radius: ${cornerRadius}px;
            pointer-events: none;
            transition: all 0.2s ease-out;
            opacity: ${isActive ? 0.5 : 0};
            background-image: radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 80%);
            mix-blend-mode: overlay;
        `}></div>
        <div style={`
            position: absolute; inset: 0; width: ${autoPx(glassSize.width + 1)};
            border-radius: ${cornerRadius}px;
            pointer-events: none;
            transition: all 0.2s ease-out;
            opacity: ${isHovered ? 0.4 : isActive ? 0.8 : 0};
            background-image: radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%);
            mix-blend-mode: overlay;
        `}></div>
    {/if}
</div>
