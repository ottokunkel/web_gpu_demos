import { fail } from "./errorHandler";
type Vertex = {
  position: [number, number];
};

type ShaderTriangle = {
  color: number[];
  offset: number[];
  vertices: Vertex[];
};

class TriangleManager {
  private triangleList: ShaderTriangle[] = [];
  private trianglesBuffer: GPUBuffer | null = null;
  constructor(private device: GPUDevice) {}

  writeTrianglesIntoBuffer() {
    if (this.triangleList.length === 0) {
      fail("No triangles to write");
    }

    const storageBufferSize = this.triangleList.length * 48;

    const trianglesBuffer = this.device.createBuffer({
      label: 'Storage Buffer for triangles',
      size: storageBufferSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });

    const triangleValues = new ArrayBuffer(storageBufferSize);

    for (let i = 0; i < this.triangleList.length; i++) {
      const triangle = this.triangleList[i];
      const byteOffset = i * 48;

      const colorView = new Float32Array(triangleValues, byteOffset, 4);
      const offsetView = new Float32Array(triangleValues, byteOffset + 16, 2);
      const verticesView = new Float32Array(triangleValues, byteOffset + 24, 6);

      colorView.set(triangle.color);
      offsetView.set(triangle.offset);
      verticesView.set(triangle.vertices.flatMap((vertex: Vertex) => vertex.position));
    }

    this.device.queue.writeBuffer(trianglesBuffer, 0, triangleValues);

    this.trianglesBuffer = trianglesBuffer;

    return trianglesBuffer;
  }

  bindToPipeline(pipeline: GPURenderPipeline) {
    if (!this.trianglesBuffer || !this.trianglesBuffer) {
      fail("No triangles in buffer");
      return;
    }

    const bindGroup = this.device.createBindGroup({
      label: 'bind group for objects',
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.trianglesBuffer }},
      ],
    });

    return bindGroup;
  }

  getBuffer() {
    return this.trianglesBuffer;
  }

  getTriangleList() {
    return this.triangleList;
  }

  addTriangle(scale: number, x: number, y: number) {
    const triangle: ShaderTriangle = {
      color: [1, 0, 0, 1],
      offset: [x, y],
      vertices: [
        { position: [0, 0.5 * scale] },
        { position: [0.5 * scale, -0.5 * scale] },
        { position: [-0.5 * scale, -0.5 * scale] },
      ],
    };

    this.triangleList.push(triangle);
  }
}

export default TriangleManager;

