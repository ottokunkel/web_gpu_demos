struct Vertex {
    position: vec2f,
};

struct Triangle {
    color: vec4f,
    offset: vec2f,
    vertices: array<Vertex, 3>,
};

struct VSOutput {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
};

@group(0) @binding(0) var<storage, read> triangles: array<Triangle>;

@vertex 
fn vs(
    @builtin(vertex_index) vertexIndex : u32,
    @builtin(instance_index) instanceIndex : u32
) -> VSOutput {
    let triangle = triangles[instanceIndex];
    let pos = triangle.vertices[vertexIndex].position + triangle.offset;
    var vsOutput: VSOutput;
    vsOutput.color = triangle.color;
    vsOutput.position = vec4f(pos, 0.0, 1.0);
    return vsOutput;
};

@fragment 
fn fs(vsOutput: VSOutput) -> @location(0) vec4f {
    return vsOutput.color;
};