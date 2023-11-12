import test from "node:test";
import { tspl } from "@matteo.collina/tspl";
// import nodeAssert from 'node:assert'
import { Panorama, createPanorama } from "../index.js";

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

test("should throw if the route name is undefined", async (t) => {
  const assert = tspl(t, { plan: 1 });
  const panorama = await createPanorama();

  await assert.rejects(panorama.getRoute(), { message: /route name is undefined/ });
});

test("should throw if the route is not found", async (t) => {
  const assert = tspl(t, { plan: 1 });
  const panorama = await createPanorama();

  await assert.rejects(panorama.getRoute("/test"), { message: /route .* not found/ });
});

test("should throw if Panorama is not initialized", async (t) => {
  const assert = tspl(t, { plan: 3 });
  const panorama = new Panorama();

  await assert.rejects(panorama.addRoute({ method: "GET", url: "/", handler: () => true }), {
    message: /Panorama not initialized/,
  });

  await assert.rejects(panorama.getRoute("/"), { message: /Panorama not initialized/ });
  await assert.rejects(panorama.lookup({} as any, {} as any), { message: /Panorama not initialized/ });
});
