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

uniform vec2 u_resolution;

void main() {
    // const int numPoints = 3;

    // vec2 points[numPoints] = vec2[numPoints](cell0, cell1, cell2);
    // vec3 colors[numPoints] = vec3[numPoints](color0, color1, color2);

    // float percents[numPoints];
    // float totalPct = 0.0;

    // for (int i = 0; i < numPoints; i++) {
    //     percents[i] = 1.0 - (distance(gl_FragCoord.xy, points[i]) / length(u_resolution.xy));
    //     totalPct += percents[i];
    // }

    // float m_dist = 0.0;
    // vec3 color = vec3(0.0);
    // for (int i = 0; i < numPoints; i++) {
    //     float pct = (percents[i] * percents[i] * percents[i]) / totalPct;
    //     color += colors[i] * pct;

    //     if ( pct > m_dist ) {
    //         m_dist = pct;
    //     }
    // }

    vec3 color = colorBg;
    color = mix(color0, color, distance(gl_FragCoord.xy, cell0) / length(u_resolution));
    color = mix(color1, color, distance(gl_FragCoord.xy, cell1) / length(u_resolution));
    color = mix(color2, color, distance(gl_FragCoord.xy, cell2) / length(u_resolution));

    // color += m_dist;
    gl_FragColor = vec4(color, 0.5);
}