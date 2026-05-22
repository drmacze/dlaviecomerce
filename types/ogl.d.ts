declare module 'ogl' {
  export class Renderer {
    gl: WebGL2RenderingContext & { canvas: HTMLCanvasElement };
    constructor(options?: Record<string, unknown>);
    setSize(width: number, height: number): void;
    render(options: { scene: unknown }): void;
  }

  export class Program {
    uniforms: Record<string, { value: unknown }>;
    constructor(gl: WebGL2RenderingContext, options: Record<string, unknown>);
  }

  export class Mesh {
    constructor(gl: WebGL2RenderingContext, options: { geometry: unknown; program: Program });
  }

  export class Color {
    r: number;
    g: number;
    b: number;
    constructor(hex: string);
  }

  export class Triangle {
    attributes: Record<string, unknown>;
    constructor(gl: WebGL2RenderingContext);
  }
}
