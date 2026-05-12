#version 300 es
precision highp float;

in vec2 vTexCoord;
uniform sampler2D uImage;
uniform vec2 uResolution;
uniform vec2 uImageScale;
uniform vec2 uImageOffset;
uniform float threshold;
out vec4 fragColor;

vec3 sampleImage(vec2 canvasCoord) {
    vec2 imageCoord = (canvasCoord - uImageOffset) / uImageScale;
    if (imageCoord.x < 0.0 || imageCoord.x > 1.0 || imageCoord.y < 0.0 || imageCoord.y > 1.0) {
        return vec3(0.0);
    }

    return texture(uImage, imageCoord).rgb;
}

void main() {
    vec2 texel = 1.0 / uResolution;
    vec2 tc = vTexCoord;
    
    vec3 tl = sampleImage(tc + texel * vec2(-1, -1));
    vec3 t  = sampleImage(tc + texel * vec2( 0, -1));
    vec3 tr = sampleImage(tc + texel * vec2( 1, -1));
    vec3 l  = sampleImage(tc + texel * vec2(-1,  0));
    vec3 c  = sampleImage(tc);
    vec3 r  = sampleImage(tc + texel * vec2( 1,  0));
    vec3 bl = sampleImage(tc + texel * vec2(-1,  1));
    vec3 b  = sampleImage(tc + texel * vec2( 0,  1));
    vec3 br = sampleImage(tc + texel * vec2( 1,  1));

    vec3 gx = -tl - 2.0 * l - bl + tr + 2.0 * r + br;
    vec3 gy = -tl - 2.0 * t - tr + bl + 2.0 * b + br;
    
    float edge = length(gx) + length(gy);
    edge = edge > threshold ? 1.0 : 0.0;
    
    fragColor = vec4(edge, edge, edge, 1.0);
}
