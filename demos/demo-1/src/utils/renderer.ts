import { fail } from "./errorHandler";

class WebGPURenderer {
  private canvas: HTMLCanvasElement | null = null;
  private adapter: GPUAdapter | null = null;
  private device: GPUDevice | null = null;
  private context: GPUCanvasContext | null = null;
  private format: GPUTextureFormat | null = null;
  private pipeline: GPURenderPipeline | null = null;
  private renderPassDescriptor: GPURenderPassDescriptor & { colorAttachments: GPURenderPassColorAttachment[] } | null = null;

  constructor(private canvasId: string, private shader: string) {}

  async init() {
    this.canvas = <HTMLCanvasElement>document.getElementById(this.canvasId);
    this.adapter = await navigator.gpu.requestAdapter();
    this.device = <GPUDevice | null> await this.adapter?.requestDevice();
    this.context = this.canvas?.getContext("webgpu");
    this.format = navigator.gpu.getPreferredCanvasFormat();

    if (!this.adapter || !this.device || !this.context || !this.canvas || !this.format) {
      throw new Error("Failed to initialize screen");
    }

    this.context.configure({
      device: this.device,
      format: this.format,
    });

    this.setupShaderPipeline();
    this.setupRenderPassDescriptor();
  }

  private setupShaderPipeline() {
    if (!this.device || !this.format || !this.shader) {
      fail("No device or format");
      return;
    }

    const shaderModule = this.device.createShaderModule({
      code: this.shader,
    });

    this.pipeline = this.device.createRenderPipeline({
      layout: "auto",
      vertex: {
        module: shaderModule,
      },
      fragment: {
        module: shaderModule,
        targets: [{ format: this.format }],
      },
    });
  }

  private setupRenderPassDescriptor() {
    this.renderPassDescriptor = {
      label: 'our basic canvas renderPass',
      colorAttachments: [
        {
          view: null as unknown as GPUTextureView,
          clearValue: [0.3, 0.3, 0.3, 1],
          loadOp: 'clear',
          storeOp: 'store',
        } as GPURenderPassColorAttachment,
      ],
    };
  }

  render(numberOfInstances: number, bindGroups: GPUBindGroup[]) {
    if (!this.context || !this.renderPassDescriptor || !this.pipeline || !this.device) {
      fail("No context, renderPassDescriptor, pipeline, or device");
      return;
    }

    this.renderPassDescriptor.colorAttachments[0].view = this.context.getCurrentTexture().createView();

    const encoder = this.device.createCommandEncoder({ label: 'our encoder' });

    const pass = encoder.beginRenderPass(this.renderPassDescriptor);
    pass.setPipeline(this.pipeline);

    for (let i = 0; i < numberOfInstances; i++) {
      pass.setBindGroup(i, bindGroups[i]);
    }

    pass.draw(3, numberOfInstances);
    pass.end();

    const commandBuffer = encoder.finish();
    this.device.queue.submit([commandBuffer]);
  }

  getDevice() {
    if (!this.device) {
      throw new Error("No device");
    }
    return this.device;
  }

  getPipeline() {
    if (!this.pipeline) {
      throw new Error("No pipeline");
    }
    return this.pipeline;
  }
}

export default WebGPURenderer;
