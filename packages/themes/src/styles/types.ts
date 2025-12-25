export interface StylePreset {
  id: string
  name: string
  description: string

  spacing: {
    blockPadding: string
    sectionGap: string
  }

  borders: {
    radius: string
    radiusLarge: string
  }

  shadows: {
    card: string
    elevated: string
  }
}
