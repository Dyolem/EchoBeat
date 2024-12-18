export const EDITOR_MODE_ENUM = {
  SELECT: "select",
  INSERT: "insert",
  VELOCITY: "velocity",
}
export const TENSILE_ADSORPTION_GRID_THRESHOLD = 3

export const NOTE_ELEMENT_SIZE = {
  baseWidth: 20,
  baseHeight: 9.3,
}

export const DEFAULT_ZOOM_RATIO = 1
export const ZOOM_THRESHOLD = 0.1
export const MAX_ZOOM = 6
export const MIN_ZOOM = 0.8
export const ZOOM_PARAMETERS = {
  zoomThreshold: ZOOM_THRESHOLD,
  zoomScale: [MIN_ZOOM, MAX_ZOOM],
}
export const NOTE_ELEMENT_MIN_SIZE = {
  minWidth: NOTE_ELEMENT_SIZE.baseWidth * MIN_ZOOM,
  minHeight: NOTE_ELEMENT_SIZE.baseHeight * MIN_ZOOM,
}
export const BEATS_NUMBER = 95
export const BASE_GRID_WIDTH = 20
export const MIN_GRID_WIDTH = BASE_GRID_WIDTH * MIN_ZOOM
export const BASE_GRID_HEIGHT = 90
