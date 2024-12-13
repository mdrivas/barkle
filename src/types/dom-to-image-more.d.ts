declare module 'dom-to-image-more' {
  export function toPng(
    node: HTMLElement, 
    options?: {
      width?: number;
      height?: number;
      bgcolor?: string;
      style?: Record<string, string>;
    }
  ): Promise<string>;
} 