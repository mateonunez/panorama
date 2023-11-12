import nodeAssert from "node:assert";
import http, { IncomingMessage, ServerResponse } from "node:http";
import { test } from "node:test";
import { tspl } from "@matteo.collina/tspl";
import { createPanorama } from "../index.js";
import { httpGet, httpPost } from "./utils/http.js";

// Function to start the server and return a function to stop it
function startServer(server: http.Server): any {
  return new Promise((resolve) => {
    server.listen(0, () => {
      server.unref();
      const stopServer = () =>
        new Promise((resolveClose, rejectClose) => {
          server.close((err) => {
            if (err) rejectClose(err);
            else resolveClose(true);
          });
        });
      // @ts-expect-error - object is possibly undefined
      resolve({ server, stopServer, port: server.address().port });
    });
  });
}

test("basic url", async (t) => {
  const assert = tspl(t, { plan: 1 });
  const panorama = await createPanorama();

  await panorama.addRoute({
    method: "GET",
    url: "/",
    handler: () => new Response("hello panorama"),
  });

  const route = await panorama.getRoute("/");

  assert.equal(route.url, "/");
});

test("basic router", async (t) => {
  const assert = tspl(t, { plan: 6 });
  const panorama = await createPanorama();

  // @ts-expect-error - require type assertion
  assert.ok(panorama.routes);
  // @ts-expect-error - require type assertion
  assert.ok(panorama.orama);

  await panorama.addRoute({
    method: "GET",
    url: "/test",
    handler: () => new Response("hello panorama"),
  });

  const route = await panorama.getRoute("/test");

  assert.equal(route.method, "GET");
  assert.equal(route.url, "/test");
  const result = route.handler({} as IncomingMessage, {} as ServerResponse);
  assert.equal(result.status, 200);
  assert.equal(await result.text(), "hello panorama");
});

test("http server with panorama", async (t) => {
  const assert = tspl(t, { plan: 4 });
  const panorama = await createPanorama();

  await panorama.addRoute({
    method: "GET",
    url: "/test",
    handler: (req: IncomingMessage, res: ServerResponse) => {
      // @ts-expect-error - require type assertion
      assert.ok(req);
      // @ts-expect-error - require type assertion
      assert.ok(res);
      res.end(JSON.stringify({ hello: "panorama" }));
    },
  });

  const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
    panorama.lookup(req, res);
  });

  const { stopServer, port } = await startServer(server);
  const { body, statusCode } = await httpGet(`http://localhost:${port}/test`);

  assert.deepEqual(body, { hello: "panorama" });
  assert.equal(statusCode, 200);

  await stopServer();
});

test('http server with panorama and "not found" route', async (t) => {
  const assert = tspl(t, { plan: 4 });
  const panorama = await createPanorama();

  await panorama.addRoute({
    method: "GET",
    url: "/test",
    handler: (req: IncomingMessage, res: ServerResponse) => {
      // @ts-expect-error - require type assertion
      assert.ok(req);
      // @ts-expect-error - require type assertion
      assert.ok(res);
      res.end(JSON.stringify({ hello: "panorama" }));
    },
  });

  await panorama.addRoute({
    method: "GET",
    url: "/not-found",
    handler: (req: IncomingMessage, res: ServerResponse) => {
      // @ts-expect-error - require type assertion
      assert.ok(req);
      // @ts-expect-error - require type assertion
      assert.ok(res);
      res.end(JSON.stringify({ hello: "not found" }));
    },
  });

  const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
    panorama.lookup(req, res);
  });

  const { stopServer, port } = await startServer(server);
  const { body, statusCode } = await httpGet(`http://localhost:${port}/not-found`);

  assert.deepEqual(body, { hello: "not found" });
  assert.equal(statusCode, 200);

  await stopServer();
});

test("http server with panorama and params", async (t) => {
  const assert = tspl(t, { plan: 5 });
  const panorama = await createPanorama();

  await panorama.addRoute({
    method: "GET",
    url: "/test/:id",
    handler: (req: IncomingMessage, res: ServerResponse, params?: Record<string, string>) => {
      // @ts-expect-error - require type assertion
      assert.ok(req);
      // @ts-expect-error - require type assertion
      assert.ok(res);
      assert.deepEqual(params, { id: "another" });
      res.end(JSON.stringify({ ...params }));
    },
  });

  const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
    panorama.lookup(req, res);
  });

  const { stopServer, port } = await startServer(server);
  const { body, statusCode } = await httpGet(`http://localhost:${port}/test/another`);

  assert.deepEqual(body, { id: "another" });
  assert.equal(statusCode, 200);

  await stopServer();
});

test("nested routes", async (t) => {
  await t.test("basic nested routes", async (t) => {
    const assert = tspl(t, { plan: 2 });
    const panorama = await createPanorama();

    await panorama.addRoute({
      method: "GET",
      url: "/test",
      handler: (req: IncomingMessage, res: ServerResponse) => {
        nodeAssert.ok(req);
        nodeAssert.ok(res);
        res.end(JSON.stringify({ hello: "panorama" }));
      },
    });

    await panorama.addRoute({
      method: "GET",
      url: "/test/another",
      handler: (req: IncomingMessage, res: ServerResponse) => {
        nodeAssert.ok(req);
        nodeAssert.ok(res);
        res.end(JSON.stringify({ hello: "another panorama" }));
      },
    });

    const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
      panorama.lookup(req, res);
    });

    const { stopServer, port } = await startServer(server);
    const { body, statusCode } = await httpGet(`http://localhost:${port}/test/another`);

    assert.deepEqual(body, { hello: "another panorama" });
    assert.equal(statusCode, 200);

    await stopServer();
  });

  await t.test("nested routes with params", async (t) => {
    const assert = tspl(t, { plan: 3 });
    const panorama = await createPanorama();

    await panorama.addRoute({
      method: "GET",
      url: "/test/:id",
      handler: (req: IncomingMessage, res: ServerResponse, params?: Record<string, string>) => {
        nodeAssert.ok(req);
        nodeAssert.ok(res);
        assert.deepEqual(params, { id: "another" });
        res.end(JSON.stringify({ from: "route" }));
      },
    });

    await panorama.addRoute({
      method: "GET",
      url: "/test/:id/another",
      handler: (req: IncomingMessage, res: ServerResponse, params?: Record<string, string>) => {
        nodeAssert.ok(req);
        nodeAssert.ok(res);
        assert.deepEqual(params, { id: "nested" });
        res.end(JSON.stringify({ from: "nested-route-with-params" }));
      },
    });

    const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
      panorama.lookup(req, res);
    });

    const { stopServer, port } = await startServer(server);
    const { body, statusCode } = await httpGet(`http://localhost:${port}/test/nested/another`);

    assert.deepEqual(body, { from: "nested-route-with-params" });
    assert.equal(statusCode, 200);

    await stopServer();
  });
});

test("multiple methods", async (t) => {
  await t.test("root route", async (t) => {
    const assert = tspl(t, { plan: 4 });

    const panorama = await createPanorama();
    await panorama.addRoute({
      method: "GET",
      url: "/test",
      handler: (req: IncomingMessage, res: ServerResponse) => {
        nodeAssert.ok(req);
        nodeAssert.ok(res);
        res.end(JSON.stringify({ from: "get" }));
      },
    });

    await panorama.addRoute({
      method: "POST",
      url: "/test",
      handler: (req: IncomingMessage, res: ServerResponse) => {
        nodeAssert.ok(req);
        nodeAssert.ok(res);
        res.end(JSON.stringify({ from: "post" }));
      },
    });

    const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
      panorama.lookup(req, res);
    });

    const { stopServer, port } = await startServer(server);

    const { body: getBody, statusCode: getStatusCode } = await httpGet(`http://localhost:${port}/test`);

    assert.deepEqual(getBody, { from: "get" });
    assert.equal(getStatusCode, 200);

    const { body: postBody, statusCode: postStatusCode } = await httpPost(`http://localhost:${port}/test`, {
      from: "post",
    });

    assert.deepEqual(postBody, { from: "post" });
    assert.equal(postStatusCode, 200);

    await stopServer();
  });
});
