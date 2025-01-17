import shader from "./shaders/shader.wgsl";

async function init() {
  const canvas = <HTMLCanvasElement> document.getElementById("canvas");
  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter?.requestDevice();
  const context = canvas.getContext("webgpu");
  const format = navigator.gpu.getPreferredCanvasFormat();

  if (!adapter || !device || !context) {
    return;
  }

  context.configure({
    device,
    format,
  });

  return { adapter, device, context, format, canvas };
}

async function main() { 

  const initResult = await init();

  if (!initResult) {
    fail("Failed to initialize WebGPU");
    return;
  }

  const { adapter, device, context, format, canvas } = initResult;
  
  const shaderModule = device.createShaderModule({
    code: shader,
  });

  const pipeline = device.createRenderPipeline({
    layout: "auto",
    vertex: {
      module: shaderModule,
    },
    fragment: {
      module: shaderModule,
      targets: [{ format }],
    },
  });

  const renderPassDescriptor = {
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

  function render() {
    // Get the current texture from the canvas context and
    // set it as the texture to render to.
    renderPassDescriptor.colorAttachments[0].view =
        context.getCurrentTexture().createView();

    // make a command encoder to start encoding commands
    const encoder = device.createCommandEncoder({ label: 'our encoder' });

    // make a render pass encoder to encode render specific commands
    const pass = encoder.beginRenderPass(renderPassDescriptor);
    pass.setPipeline(pipeline);
    pass.draw(3);  // call our vertex shader 3 times.
    pass.end();

    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);
  }

  render();
}

main();

function fail(message: string) {
  throw new Error(message);
}
