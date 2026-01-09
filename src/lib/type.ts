import type { FragmentShaderType } from './shader-util'

export enum GlassMode {
  standard = 'standard',
  polar = 'polar',
  prominent = 'prominent',
  shader = 'shader',
}

export interface GlassFilterProps {
  id: string
  displacementScale: number
  aberrationIntensity: number
  width: number | string
  height: number | string
  mode: GlassMode
  shaderMapUrl?: string
}

export interface GlassContainerProps {
  class?: string
  style?: string
  displacementScale?: number
  blurAmount?: number
  saturation?: number
  aberrationIntensity?: number
  mouseOffset?: { x: number; y: number }
  onMouseLeave?: () => void
  onMouseEnter?: () => void
  onMouseDown?: () => void
  onMouseUp?: () => void
  active?: boolean
  overLight?: boolean
  cornerRadius?: number
  padding?: string
  glassSize?: { width: number; height: number }
  onClick?: () => void
  mode?: GlassMode,
  effect?: FragmentShaderType
  children?: any
}

export interface LiquidGlassProps {
  displacementScale?: number
  blurAmount?: number
  saturation?: number
  aberrationIntensity?: number
  elasticity?: number
  cornerRadius?: number
  globalMousePos?: { x: number; y: number }
  mouseOffset?: { x: number; y: number }
  mouseContainer?: HTMLElement
  class?: string
  padding?: string
  style?: string
  overLight?: boolean
  mode?: GlassMode
  onClick?: () => void,
  effect?: FragmentShaderType
  children?: any
}
