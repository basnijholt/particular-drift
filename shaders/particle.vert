#version 300 es
layout(location = 0) in vec2 position;
layout(location = 1) in vec2 velocity;
layout(location = 2) in vec2 target;

uniform float particleSize;

out vec2 vPosition;
out vec2 vVelocity;
out vec2 vTarget;

void main() {
    vPosition = position;
    vVelocity = velocity;
    vTarget = target;
    gl_Position = vec4(position * 2.0 - 1.0, 0, 1);
    gl_PointSize = 2.0 * particleSize;
}
