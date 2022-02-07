import execa from "execa";
import fs from "fs";
import os from "os";
import path from "path";
import sharp from "sharp";
import { selectColor } from "../packages/example/src/Framer";

const getMissedFramesforCodec = async (codec: "mp4" | "webm") => {
  const outputPath = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), "remotion-")
  );

  // render the VideoTesting example (which contains the Framer composition embedded with <Video>) to an image
  // sequence which can be checked for accuracy
  await execa(
    "npx",
    [
      "remotion",
      "render",
      "src/index.tsx",
      `video-testing-${codec}`,
      outputPath,
      "--image-format",
      "jpeg",
      "--quality",
      "100",
      "--sequence",
    ],
    {
      cwd: "packages/example",
      reject: false,
    }
  );

  let missedFrames = 0;

  for (let frame = 0; frame < 100; frame++) {
    // each frame of the embedded video contains a (deterministically) random color which should appear correctly
    // in the rendered output
    const expectedColor = {
      red: selectColor("red", frame),
      green: selectColor("green", frame),
      blue: selectColor("blue", frame),
    };

    // extract the actual RGB color value of the top left pixel in the frame image that was generated by remotion
    const paddedIndex = String(frame).padStart(2, "0");
    const filename = path.join(outputPath, `element-${paddedIndex}.jpeg`);
    const img = await sharp(filename).raw().toBuffer();

    const actualColor = {
      red: img.readUInt8(0),
      green: img.readUInt8(1),
      blue: img.readUInt8(2),
    };

    const colorDistance = {
      red: Math.abs(expectedColor.red - actualColor.red),
      green: Math.abs(expectedColor.green - actualColor.green),
      blue: Math.abs(expectedColor.blue - actualColor.blue),
    };

    // encoding sometimes shifts the color slightly - so measure the distance between the expected and actual
    // colors and consider any frame not within an acceptable range to be wrong
    const highestDistance = Math.max(
      colorDistance.red,
      colorDistance.blue,
      colorDistance.green
    );
    const threshold = 40;
    if (highestDistance > threshold) {
      console.log(colorDistance, { threshold, frame, filename });
      missedFrames++;
    }
  }
  return missedFrames;
};

test("should render correct frames from embedded videos - WebM", async () => {
  const missedFrames = await getMissedFramesforCodec("webm");
  expect(missedFrames).toBe(0);
});

test("should render correct frames from embedded videos - MP4", async () => {
  const missedFrames = await getMissedFramesforCodec("mp4");
  expect(missedFrames).toBe(0);
});