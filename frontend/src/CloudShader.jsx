import { useEffect, useRef } from 'react'

const vertexShaderSource = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

const fragmentShaderSource = `
precision highp float;

varying vec2 v_uv;
uniform vec2 u_resolution;
uniform float u_time;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p = mat2(0.8, 0.6, -0.6, 0.8) * p * 2.03 + 17.1;
    amplitude *= 0.5;
  }
  return value;
}

float billow(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amplitude * (1.0 - abs(2.0 * noise(p) - 1.0));
    p = mat2(0.8, 0.6, -0.6, 0.8) * p * 2.07 + 11.3;
    amplitude *= 0.5;
  }
  return value;
}

float cloudDensity(vec2 p, vec2 center, vec2 radius, float seed, float time) {
  vec2 q = p - center;
  float verticalRadius = q.y > 0.0 ? radius.y : radius.y * 0.48;
  float envelope = 1.0 - length(vec2(q.x / radius.x, q.y / verticalRadius));
  if (envelope < -0.25) return 0.0;

  vec2 point = q * (2.2 / radius.x) + vec2(seed, seed * 0.71);
  point += 0.45 * vec2(
    fbm(point * 1.4 + vec2(time * 0.025)),
    fbm(point * 1.4 + vec2(8.0 - time * 0.018))
  );
  return envelope + (billow(point * 1.5) - 0.48) * 0.55;
}

vec3 shadeCloud(vec3 background, vec2 p, vec2 center, vec2 radius, float seed, float time, float fade) {
  float density = cloudDensity(p, center, radius, seed, time);
  if (density < 0.015) return background;

  float above = cloudDensity(p + vec2(0.0, radius.y * 0.45), center, radius, seed, time);
  float shadow = clamp((above - density) * 1.1 + density * 0.55, 0.0, 1.0);
  vec3 cloudColor = mix(vec3(1.0, 0.99, 1.0), vec3(0.69, 0.71, 0.88), shadow * 0.78);
  float alpha = smoothstep(0.015, 0.32, density) * fade;
  return mix(background, cloudColor, alpha);
}

vec3 driftingCloud(vec3 background, vec2 p, float aspect, float time, float speed, float phase, float y, vec2 radius, float seed, float fade) {
  float x = mix(-radius.x - 0.2, aspect + radius.x + 0.2, fract(time * speed + phase));
  float bob = sin(time * 0.045 + phase * 6.2831) * 0.012;
  return shadeCloud(background, p, vec2(x, y + bob), radius, seed, time, fade);
}

void main() {
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = vec2(v_uv.x * aspect, v_uv.y);
  vec3 sky = mix(vec3(0.91, 0.88, 0.99), vec3(0.68, 0.79, 0.97), v_uv.y);
  float sun = exp(-length(p - vec2(aspect * 0.78, 0.9)) * 4.0);
  sky += vec3(0.10, 0.08, 0.12) * sun;

  vec3 color = sky;
  color = driftingCloud(color, p, aspect, u_time, 0.006, 0.08, 0.82, vec2(0.26, 0.13), 43.7, 0.52);
  color = driftingCloud(color, p, aspect, u_time, 0.009, 0.54, 0.67, vec2(0.34, 0.17), 71.3, 0.72);
  color = driftingCloud(color, p, aspect, u_time, 0.012, 0.29, 0.47, vec2(0.42, 0.20), 17.3, 0.88);
  color = driftingCloud(color, p, aspect, u_time, 0.015, 0.76, 0.27, vec2(0.52, 0.24), 29.9, 0.96);
  gl_FragColor = vec4(color, 1.0);
}
`

function compileShader(gl, type, source) {
  const shader = gl.createShader(type)
  if (!shader) {
    console.error('Cloud Shader could not create a WebGL shader.')
    return null
  }

  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Cloud Shader compilation failed:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }

  return shader
}

export default function CloudShader() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas?.getContext('webgl', { alpha: false, antialias: false })
    if (!canvas || !gl) return

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
    if (!vertexShader || !fragmentShader) {
      if (vertexShader) gl.deleteShader(vertexShader)
      if (fragmentShader) gl.deleteShader(fragmentShader)
      return
    }

    const program = gl.createProgram()
    if (!program) {
      console.error('Cloud Shader could not create a WebGL program.')
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
      return
    }

    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.bindAttribLocation(program, 0, 'a_position')
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Cloud Shader linking failed:', gl.getProgramInfoLog(program))
      gl.deleteProgram(program)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
      return
    }

    const buffer = gl.createBuffer()
    if (!buffer) {
      console.error('Cloud Shader could not create a WebGL buffer.')
      gl.deleteProgram(program)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
      return
    }

    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution')
    const timeLocation = gl.getUniformLocation(program, 'u_time')
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    let startTime = performance.now()

    const render = (time) => {
      gl.uniform1f(timeLocation, time)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      const width = Math.max(1, Math.floor(canvas.clientWidth * ratio))
      const height = Math.max(1, Math.floor(canvas.clientHeight * ratio))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }
      gl.viewport(0, 0, width, height)
      gl.uniform2f(resolutionLocation, width, height)
      if (reduceMotion) render(0)
    }

    const draw = (now) => {
      const time = (now - startTime) / 1000
      render(time)
      frame = window.requestAnimationFrame(draw)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()
    if (reduceMotion) {
      render(0)
    } else {
      frame = window.requestAnimationFrame(draw)
    }

    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
    }
  }, [])

  return <div className="cloud-shader" aria-hidden="true"><canvas ref={canvasRef} /></div>
}
