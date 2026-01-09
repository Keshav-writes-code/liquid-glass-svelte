<script lang="ts">
  import { type GlassFilterProps, GlassMode } from '../type';
  import { autoPx, displacementMap, polarDisplacementMap, prominentDisplacementMap } from '../utils';

  let {
    id,
    displacementScale,
    aberrationIntensity,
    width,
    height,
    mode,
    shaderMapUrl
  }: GlassFilterProps = $props();

  const getMap = (m: string, url?: string) => {
      switch (m) {
          case GlassMode.standard:
              return displacementMap
          case GlassMode.polar:
              return polarDisplacementMap
          case GlassMode.prominent:
              return prominentDisplacementMap
          case GlassMode.shader:
              return url || displacementMap
          default:
              return displacementMap
      }
  }

  let scale = $derived(mode === GlassMode.shader ? 1 : -1);
  let offset = $derived(`${Math.max(30, 80 - aberrationIntensity * 2)}%`);
  let customFilterStyle = $derived(`position: absolute; width: ${autoPx(width)}; height: ${autoPx(height)};`);
</script>

<svg style={customFilterStyle} aria-hidden="true">
    <defs>
        <radialGradient id={`${id}-edge-mask`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="black" stop-opacity="0" />
            <stop offset={offset} stop-color="black" stop-opacity="0" />
            <stop offset="100%" stop-color="white" stop-opacity="1" />
        </radialGradient>
        <filter {id} x="-35%" y="-35%" width="170%" height="170%" color-interpolation-filters="sRGB">
            <feImage x="0" y="0" width="100%" height="100%" result="DISPLACEMENT_MAP"
                href={getMap(mode, shaderMapUrl)} preserveAspectRatio="xMidYMid slice" />

            <!-- Create edge mask using the displacement map itself -->
            <feColorMatrix in="DISPLACEMENT_MAP" type="matrix" values="0.3 0.3 0.3 0 0
             0.3 0.3 0.3 0 0
             0.3 0.3 0.3 0 0
             0 0 0 1 0" result="EDGE_INTENSITY" />
            <feComponentTransfer in="EDGE_INTENSITY" result="EDGE_MASK">
                <feFuncA type="discrete" tableValues={`0 ${aberrationIntensity * 0.05} 1`} />
            </feComponentTransfer>

            <!-- Original undisplaced image for center -->
            <feOffset in="SourceGraphic" dx="0" dy="0" result="CENTER_ORIGINAL" />

            <!-- Red channel displacement with slight offset -->
            <feDisplacementMap in="SourceGraphic" in2="DISPLACEMENT_MAP" scale={displacementScale * scale}
                xChannelSelector="R" yChannelSelector="B" result="RED_DISPLACED" />
            <feColorMatrix in="RED_DISPLACED" type="matrix" values="1 0 0 0 0
             0 0 0 0 0
             0 0 0 0 0
             0 0 0 1 0" result="RED_CHANNEL" />

            <!-- Green channel displacement -->
            <feDisplacementMap in="SourceGraphic" in2="DISPLACEMENT_MAP"
                scale={displacementScale * (scale - aberrationIntensity * 0.05)} xChannelSelector="R"
                yChannelSelector="B" result="GREEN_DISPLACED" />
            <feColorMatrix in="GREEN_DISPLACED" type="matrix" values="0 0 0 0 0
             0 1 0 0 0
             0 0 0 0 0
             0 0 0 1 0" result="GREEN_CHANNEL" />

            <!-- Blue channel displacement with slight offset -->
            <feDisplacementMap in="SourceGraphic" in2="DISPLACEMENT_MAP"
                scale={displacementScale * (scale - aberrationIntensity * 0.1)} xChannelSelector="R"
                yChannelSelector="B" result="BLUE_DISPLACED" />
            <feColorMatrix in="BLUE_DISPLACED" type="matrix" values="0 0 0 0 0
             0 0 0 0 0
             0 0 1 0 0
             0 0 0 1 0" result="BLUE_CHANNEL" />

            <!-- Combine all channels with screen blend mode for chromatic aberration -->
            <feBlend in="GREEN_CHANNEL" in2="BLUE_CHANNEL" mode="screen" result="GB_COMBINED" />
            <feBlend in="RED_CHANNEL" in2="GB_COMBINED" mode="screen" result="RGB_COMBINED" />

            <!-- Add slight blur to soften the aberration effect -->
            <feGaussianBlur in="RGB_COMBINED" stdDeviation={Math.max(0.1, 0.5 - aberrationIntensity * 0.1)}
                result="ABERRATED_BLURRED" />

            <!-- Apply edge mask to aberration effect -->
            <feComposite in="ABERRATED_BLURRED" in2="EDGE_MASK" operator="in" result="EDGE_ABERRATION" />

            <!-- Create inverted mask for center -->
            <feComponentTransfer in="EDGE_MASK" result="INVERTED_MASK">
                <feFuncA type="table" tableValues="1 0" />
            </feComponentTransfer>
            <feComposite in="CENTER_ORIGINAL" in2="INVERTED_MASK" operator="in" result="CENTER_CLEAN" />

            <!-- Combine edge aberration with clean center -->
            <feComposite in="EDGE_ABERRATION" in2="CENTER_CLEAN" operator="over" />
        </filter>
    </defs>
</svg>
