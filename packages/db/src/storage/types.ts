export interface Storage {
  get<T>(table: string, key: Record<string, string>): Promise<T | null>
  put(table: string, item: unknown): Promise<void>
  delete(table: string, key: Record<string, string>): Promise<void>
}
