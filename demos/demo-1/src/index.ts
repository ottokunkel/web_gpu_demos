import { fail } from "./utils/errorHandler";
import WebGPURenderer from "./utils/renderer";
import TriangleManager from "./utils/triangles";
import shader from "./shaders/shader.wgsl";

async function main() { 
  const renderer = new WebGPURenderer("canvas", shader);
  await renderer.init();

  const device = renderer.getDevice();
  const pipeline = renderer.getPipeline();

  const triangleManager = new TriangleManager(device);


  triangleManager.addTriangle(0.1, 1, 0);
  
  triangleManager.writeTrianglesIntoBuffer();
  const triangleList = triangleManager.getTriangleList();
  const bindGroup = triangleManager.bindToPipeline(pipeline);

  if (!bindGroup) {
    fail("No bind group");
    return;
  }

  renderer.render(triangleList.length, [bindGroup]);
}

main();