import test from "node:test";
import { tspl } from "@matteo.collina/tspl";
import { createPanorama } from "../index.js";

test("should throw if the route already exists", async (t) => {
  const assert = tspl(t, { plan: 1 });
  const panorama = await createPanorama();

  await panorama.addRoute({
    method: "GET",
    url: "/test",
    handler: () => new Response("hello panorama"),
  });

  const route = await panorama.getRoute("/test");

  await assert.rejects(
    panorama.addRoute({
      method: "GET",
      url: "/test",
      handler: () => new Response("hello panorama"),
      __documentId: route.__documentId,
    }),
    { message: /route .* already exists/ },
  );
});
