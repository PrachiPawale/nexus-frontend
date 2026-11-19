import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  Input,
} from "@angular/core";

@Component({
  selector: "app-orb",
  templateUrl: "./orb.component.html",
  styleUrls: ["./orb.component.css"],
})
export class OrbComponent implements AfterViewInit, OnDestroy {
  @ViewChild("orbCanvas", { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() colors: string[] = ["#9c43fe", "#4cc2e9", "#101499"];
  @Input() speed = 1;
  @Input() glow = 1;
  @Input() backgroundColor = "#000000";

  private animationId = 0;
  private gl!: WebGL2RenderingContext;
  private program!: WebGLProgram;
  private startTime = 0;
  private resizeObserver!: ResizeObserver;

  private vertexShader = `#version 300 es
    in vec2 aPosition;

    void main() {
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  private fragmentShader = `#version 300 es
    precision highp float;

    uniform vec2 uResolution;
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform float uGlow;

    out vec4 outColor;

    void main() {
      vec2 uv = (gl_FragCoord.xy - uResolution * 0.5)
                / min(uResolution.x, uResolution.y);

      float distanceFromCenter = length(uv);

      float noise = sin(uv.x * 10.0 + uTime)
                  * cos(uv.y * 10.0 + uTime);

      float wave = sin(distanceFromCenter * 15.0 - uTime * 2.0 + noise * 2.0);

      float orb = smoothstep(0.52, 0.35, distanceFromCenter);

      float glow = exp(-distanceFromCenter * 3.5) * uGlow;

      vec3 color = mix(uColor1, uColor2, wave * 0.5 + 0.5);
      color = mix(color, uColor3, smoothstep(0.2, 0.5, distanceFromCenter));

      float alpha = clamp(orb * 0.85 + glow * 0.35, 0.0, 0.85);

outColor = vec4(color, alpha);
    }
  `;

  ngAfterViewInit(): void {
    this.initializeOrb();
  }

  private initializeOrb(): void {
    const canvas = this.canvasRef.nativeElement;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: true,
    });

    if (!gl) {
      console.error("WebGL2 is not supported by this browser.");
      return;
    }

    this.gl = gl;

    const vertex = this.compileShader(gl.VERTEX_SHADER, this.vertexShader);
    const fragment = this.compileShader(
      gl.FRAGMENT_SHADER,
      this.fragmentShader
    );

    if (!vertex || !fragment) return;

    const program = gl.createProgram();

    if (!program) return;

    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }

    this.program = program;

    const buffer = gl.createBuffer();

    if (!buffer) return;

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );

    const position = gl.getAttribLocation(program, "aPosition");

    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    this.resizeObserver = new ResizeObserver(() => this.resizeCanvas());
    this.resizeObserver.observe(canvas.parentElement!);

    this.resizeCanvas();
    this.startTime = performance.now();

    this.animate();
  }

  private compileShader(type: number, source: string): WebGLShader | null {
    const shader = this.gl.createShader(type);

    if (!shader) return null;

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error(this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const parent = canvas.parentElement!;

    const ratio = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = parent.clientWidth * ratio;
    canvas.height = parent.clientHeight * ratio;

    if (this.gl) {
      this.gl.viewport(0, 0, canvas.width, canvas.height);
    }
  }

  private animate = (): void => {
    if (!this.gl || !this.program) return;

    const gl = this.gl;

    const time = (performance.now() - this.startTime) / 1000;

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.program);

    gl.uniform2f(
      gl.getUniformLocation(this.program, "uResolution"),
      gl.canvas.width,
      gl.canvas.height
    );

    gl.uniform1f(
      gl.getUniformLocation(this.program, "uTime"),
      time * this.speed
    );

    const parseColor = (hex: string): number[] => {
      const value = hex.replace("#", "");
      const full =
        value.length === 3
          ? value
              .split("")
              .map((c) => c + c)
              .join("")
          : value;

      return [
        parseInt(full.substring(0, 2), 16) / 255,
        parseInt(full.substring(2, 4), 16) / 255,
        parseInt(full.substring(4, 6), 16) / 255,
      ];
    };

    const c1 = parseColor(this.colors[0]);
    const c2 = parseColor(this.colors[1]);
    const c3 = parseColor(this.colors[2]);

    gl.uniform3fv(gl.getUniformLocation(this.program, "uColor1"), c1);
    gl.uniform3fv(gl.getUniformLocation(this.program, "uColor2"), c2);
    gl.uniform3fv(gl.getUniformLocation(this.program, "uColor3"), c3);

    gl.uniform1f(gl.getUniformLocation(this.program, "uGlow"), this.glow);

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    this.animationId = requestAnimationFrame(this.animate);
  };

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    if (this.gl && this.program) {
      this.gl.deleteProgram(this.program);
    }
  }
}
