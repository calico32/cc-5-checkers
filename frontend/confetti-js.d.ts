declare module 'confetti-js' {
  interface ConfettiOptions {
    target?: string | Node;
    max?: number;
    size?: number;
    animate?: boolean;
    respawn?: boolean;
    props?: ('circle' | 'square' | 'triangle' | 'line')[]; // Types of confetti
    colors?: [r: number, g: number, b: number][];
    clock?: number;
    interval?: any;
    rotate?: boolean;
    start_from_edge?: boolean;
    width?: number;
    height?: number;
  }

  class ConfettiGenerator {
    constructor(options?: ConfettiOptions);
    render(): void;
  }

  export = ConfettiGenerator;
}
