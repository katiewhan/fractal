#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 cell0;
uniform vec2 cell1;
uniform vec2 cell2;

uniform vec3 colorBg;
uniform vec3 color0;
uniform vec3 color1;
uniform vec3 color2;

uniform float alpha;
uniform vec2 u_resolution;

const float NOISE_GRANULARITY = 0.5/255.0;

float random(vec2 coords) {
   return fract(sin(dot(coords.xy, vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
    vec3 color = colorBg;
    color = mix(color0, color, distance(gl_FragCoord.xy, cell0) / length(u_resolution));
    color = mix(color1, color, distance(gl_FragCoord.xy, cell1) / length(u_resolution));
    color = mix(color2, color, distance(gl_FragCoord.xy, cell2) / length(u_resolution));

    vec2 coordinates = gl_FragCoord.xy / u_resolution;
    color += mix(-NOISE_GRANULARITY, NOISE_GRANULARITY, random(coordinates));

    gl_FragColor = vec4(color * alpha, 1.0);
}