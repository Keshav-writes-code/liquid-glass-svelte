<script lang="ts">
    import { type GlassContainerProps, GlassMode } from '../type';
    import { ShaderDisplacementGenerator } from '../shader-util';
    import GlassFilter from './GlassFilter.svelte';
    import { uuid } from '../utils';

    let {
        class: className = "",
        style = "",
        displacementScale = 25,
        blurAmount = 12,
        saturation = 180,
        aberrationIntensity = 2,
        active = false,
        overLight = false,
        cornerRadius = 999,
        padding = "24px 32px",
        glassSize = { width: 270, height: 69 },
        mode = GlassMode.standard,
        effect: effectType = "liquidGlass",
        onMouseEnter,
        onMouseLeave,
        onMouseDown,
        onMouseUp,
        onClick,
        children
    }: GlassContainerProps = $props();

    let element = $state<HTMLElement>();
    export function getElement() { return element; }

    let shaderMapUrl = $state("");
    let isFirefox = false;

    // Check for browser environment
    const isBrowser = typeof window !== 'undefined';

    if (isBrowser) {
        isFirefox = window.navigator.userAgent.toLowerCase().includes("firefox");
    }

    const filterId = uuid();

    const generateShaderDisplacementMap = async (w: number, h: number) => {
         if (!isBrowser) return "";
         const generator = new ShaderDisplacementGenerator({
            width: w,
            height: h,
            effect: effectType as any,
        })
        const dataUrl = await generator.updateShader()
        generator.destroy()
        return dataUrl
    }

    $effect(() => {
        if (mode === GlassMode.shader && isBrowser) {
             generateShaderDisplacementMap(glassSize.width, glassSize.height).then(url => {
                 shaderMapUrl = url;
             });
        }
    });

    let backdropStyle = $derived(`
        filter: ${isFirefox ? 'none' : `url(#${filterId})`};
        backdrop-filter: blur(${(overLight ? 12 : 4) + blurAmount * 32}px) saturate(${saturation}%);
        -webkit-backdrop-filter: blur(${(overLight ? 12 : 4) + blurAmount * 32}px) saturate(${saturation}%);
    `);

    let containerStyle = $derived(`
        border-radius: ${cornerRadius}px;
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 24px;
        padding: ${padding};
        overflow: hidden;
        transition: all 0.2s ease-in-out;
        box-shadow: ${overLight ? '0px 16px 70px rgba(0, 0, 0, 0.75)' : '0px 12px 40px rgba(0, 0, 0, 0.25)'};
    `);

    let contentStyle = $derived(`
        position: relative;
        z-index: 1;
        font: 500 20px/1 system-ui;
        text-shadow: ${overLight ? '0px 2px 12px rgba(0, 0, 0, 0)' : '0px 2px 12px rgba(0, 0, 0, 0.4)'};
    `);

</script>

<div
    bind:this={element}
    class={`relative ${className} ${active ? 'active' : ''} ${onClick ? 'cursor-pointer' : ''}`}
    {style}
    onclick={onClick}
    role="button"
    tabindex="0"
    onkeypress={() => {}}
>
    <GlassFilter {mode} id={filterId} {displacementScale}
            {aberrationIntensity} width={glassSize.width} height={glassSize.height}
            {shaderMapUrl} />

    <div class="glass"
         style={containerStyle}
         onmouseenter={onMouseEnter}
         onmouseleave={onMouseLeave}
         onmousedown={onMouseDown}
         onmouseup={onMouseUp}
         role="presentation"
         >

         <span class="glass__warp" style={`${backdropStyle} position: absolute; inset: 0;`}></span>

         <div class="transition-all duration-150 ease-in-out text-white" style={contentStyle}>
             {@render children?.()}
         </div>
    </div>
</div>
