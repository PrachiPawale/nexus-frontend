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

  /**
   * colors[0] = violet  (bottom / bottom-right of the ring)
   * colors[1] = cyan    (top of the ring)
   * colors[2] = deep blue (tint used where the glow fades inward)
   */
  @Input() colors: string[] = ["#9c43fe", "#4cc2e9", "#101499"];
  @Input() speed = 1;
  @Input() glow = 1;
  @Input() backgroundColor = "#130f17";

  /** Ring radius relative to the shorter canvas side (0.40 leaves room for the glow). */
  @Input() radius = 0.4;
  /** Base width of the inner glow of the ring. */
  @Input() ringWidth = 0.07;

  private animationId = 0;
  private gl!: WebGL2RenderingContext;
  private program!: WebGLProgram;
  private startTime = 0;
  private resizeObserver!: ResizeObserver;

  private hoverTarget = 0;
  private hoverAmount = 0;

  // cursor position in canvas pixels (GL coordinates, origin bottom-left)
  private mouseTarget = [0, 0];
  private mouseCurrent = [0, 0];

  private onMouseEnter = (e: MouseEvent): void => {
    this.hoverTarget = 1;
    this.updateMouse(e);
    // start at the cursor so the effect doesn't sweep in from the center
    this.mouseCurrent = [...this.mouseTarget];
  };

  private onMouseMove = (e: MouseEvent): void => {
    this.updateMouse(e);
  };

  private updateMouse(e: MouseEvent): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();

    this.mouseTarget = [
      ((e.clientX - rect.left) / rect.width) * canvas.width,
      ((rect.bottom - e.clientY) / rect.height) * canvas.height,
    ];
  }

  private onMouseLeave = (): void => {
    this.hoverTarget = 0;
  };

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
uniform vec3 uColor1;   // violet
uniform vec3 uColor2;   // cyan
uniform vec3 uColor3;   // deep blue tint
uniform float uGlow;
uniform float uHover;
uniform float uRadius;
uniform float uWidth;
uniform vec2 uMouse;    // cursor position in pixels

out vec4 outColor;

void main() {

    vec2 uv = (gl_FragCoord.xy - uResolution * 0.5)
              / min(uResolution.x, uResolution.y);

    float r = length(uv);
    float angle = atan(uv.y, uv.x);

    // ---------- CURSOR ----------
    vec2 m = (uMouse - uResolution * 0.5) / min(uResolution.x, uResolution.y);
    float mouseAngle = atan(m.y, m.x);
    // 0 at rest, grows on hover, fades out when the cursor is at the exact center
    float inf = uHover * smoothstep(0.02, 0.2, length(m));
    // 1 = this pixel is in the same direction as the cursor
    float near = 0.5 + 0.5 * cos(angle - mouseAngle);

    // Slowly rotating pattern (at time 0 it matches the reference image)
    float a = angle + uTime * 0.3;

    // ---------- COLOR AROUND THE RING ----------
    // cyan at the top  ->  periwinkle on the sides  ->  violet at the bottom
    float t = smoothstep(0.0, 1.0, 0.5 - 0.5 * cos(a - 1.75));
    vec3 col = mix(uColor2, uColor1, t);

    // slight pink push toward the bottom
    col = mix(col, vec3(0.95, 0.55, 1.0), smoothstep(0.7, 1.0, t) * 0.35);

    // white-pink hot spot at the bottom-left
    float hlBase = pow(0.5 + 0.5 * cos(a + 2.25), 5.0);
    // on hover the white-pink hot spot slides toward the cursor
    float hlMouse = pow(near, 6.0);
    float hl = mix(hlBase, hlMouse, inf);
    col = mix(col, vec3(1.0, 0.86, 1.0), hl * 0.9);

    // ---------- RING SHAPE ----------
    // ring is thicker around the bottom-left and thin at the top / right
    float th = 0.5 + 0.5 * cos(a + 2.0);
    float w = uWidth
            * (0.4 + 1.1 * th * th)
            * (1.0 + 0.08 * sin(a * 3.0 + uTime * 0.8))
            * (1.0 + 0.5 * uHover);

    // signed distance from the ring edge (negative = inside)
    // ring bulges toward the cursor and a ripple runs along it
    float angDist = acos(clamp(cos(angle - mouseAngle), -1.0, 1.0));
    float bulge = 0.035 * pow(near, 3.0)
                + 0.008 * sin(angDist * 10.0 - uTime * 5.0) * exp(-angDist * 0.8);
    float d = r - (uRadius + bulge * inf);

    // soft glow toward the center, crisp edge on the outside
    float rim = d < 0.0 ? exp(d / w) : exp(-d / 0.012);

    // thin bright line right on the edge
    float core = exp(-abs(d) / 0.004);

    // faint bloom around the ring
    float halo = exp(-abs(d) / 0.06) * 0.22 * uGlow * (0.4 + 0.6 * th);

    // glow fades toward deep blue as it goes inward
    float depth = clamp(-d / (w * 2.0), 0.0, 1.0);
    vec3 c = mix(col, mix(col, uColor3, 0.55), depth);

    float intensity = rim * (0.75 + 0.7 * hl)
                    + core * (0.25 + 0.6 * hl)
                    + halo;

    intensity *= 1.0 + 0.35 * uHover;

    // soft tone-mapping so the highlight blooms instead of clipping
    vec3 o = 1.0 - exp(-c * intensity * 1.5);

    // tiny dither to avoid gradient banding
    float n = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    o += (n - 0.5) / 255.0 * step(0.002, o.r + o.g + o.b);
    o = clamp(o, 0.0, 1.0);

    // premultiplied alpha: the interior stays fully transparent
    float alpha = max(o.r, max(o.g, o.b));

    outColor = vec4(o, alpha);
}`;

  ngAfterViewInit(): void {
    this.initializeOrb();
  }

  private initializeOrb(): void {
    const canvas = this.canvasRef.nativeElement;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
    });

    if (!gl) {
      console.error("WebGL2 is not supported by this browser.");
      return;
    }

    this.gl = gl;

    canvas.addEventListener("mouseenter", this.onMouseEnter);
    canvas.addEventListener("mouseleave", this.onMouseLeave);
    canvas.addEventListener("mousemove", this.onMouseMove);

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

  private parseColor(hex: string): number[] {
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

    // Smooth hover transition
    this.hoverAmount += (this.hoverTarget - this.hoverAmount) * 0.06;

    gl.uniform1f(
      gl.getUniformLocation(this.program, "uHover"),
      this.hoverAmount
    );

    // Smoothly follow the cursor
    this.mouseCurrent[0] += (this.mouseTarget[0] - this.mouseCurrent[0]) * 0.12;
    this.mouseCurrent[1] += (this.mouseTarget[1] - this.mouseCurrent[1]) * 0.12;

    gl.uniform2f(
      gl.getUniformLocation(this.program, "uMouse"),
      this.mouseCurrent[0],
      this.mouseCurrent[1]
    );

    gl.uniform3fv(
      gl.getUniformLocation(this.program, "uColor1"),
      this.parseColor(this.colors[0])
    );
    gl.uniform3fv(
      gl.getUniformLocation(this.program, "uColor2"),
      this.parseColor(this.colors[1])
    );
    gl.uniform3fv(
      gl.getUniformLocation(this.program, "uColor3"),
      this.parseColor(this.colors[2])
    );

    gl.uniform1f(gl.getUniformLocation(this.program, "uGlow"), this.glow);
    gl.uniform1f(gl.getUniformLocation(this.program, "uRadius"), this.radius);
    gl.uniform1f(gl.getUniformLocation(this.program, "uWidth"), this.ringWidth);

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    this.animationId = requestAnimationFrame(this.animate);
  };

  ngOnDestroy(): void {
    const canvas = this.canvasRef.nativeElement;

    canvas.removeEventListener("mouseenter", this.onMouseEnter);
    canvas.removeEventListener("mouseleave", this.onMouseLeave);
    canvas.removeEventListener("mousemove", this.onMouseMove);
    cancelAnimationFrame(this.animationId);

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    if (this.gl && this.program) {
      this.gl.deleteProgram(this.program);
    }
  }
}
