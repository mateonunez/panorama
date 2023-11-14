import MedleyRouter from "@medley/router";
import type { HTTPMethod } from "find-my-way";
import findMyWay from "find-my-way";
import KoaRouter from "koa-tree-router";
import { run, bench, group } from "mitata";
import TrekRouter from "trek-router";
import { LinearRouter } from "hono/router/linear-router";
import { RegExpRouter } from "hono/router/reg-exp-router";
import { TrieRouter } from "hono/router/trie-router";
import type { Route } from "./tool.mts";
import { createPanorama } from "../../../src/index.ts";
import { routes } from "./tool.mts";

const benchRoutes: (Route & { name: string })[] = [
  {
    name: "short static",
    method: "GET",
    path: "/user",
  },
  {
    name: 'static with same radix',
    method: 'GET',
    path: '/user/comments',
  },
  {
    name: 'dynamic route',
    method: 'GET',
    path: '/user/lookup/username/hey',
  },
  {
    name: 'mixed static dynamic',
    method: 'GET',
    path: '/event/abcd1234/comments',
  },
  {
    name: 'post',
    method: 'POST',
    path: '/event/abcd1234/comment',
  },
  {
    name: 'long static',
    method: 'GET',
    path: '/very/deeply/nested/route/hello/there',
  },
  {
    name: 'wildcard',
    method: 'GET',
    path: '/static/index.html',
  },
];

for (const benchRoute of benchRoutes) {
  group(`${benchRoute.method} ${benchRoute.path}`, () => {
    bench("RegExpRouter", () => {
      const router = new RegExpRouter();
      for (const route of routes) {
        router.add(route.method, route.path, () => {});
      }
      router.match(benchRoute.method, benchRoute.path);
    });
    bench("TrieRouter", () => {
      const router = new TrieRouter();
      for (const route of routes) {
        router.add(route.method, route.path, () => {});
      }
      router.match(benchRoute.method, benchRoute.path);
    });
    bench("LinearRouter", () => {
      const router = new LinearRouter();
      for (const route of routes) {
        router.add(route.method, route.path, () => {});
      }
      router.match(benchRoute.method, benchRoute.path);
    });
    bench("MedleyRouter", () => {
      const router = new MedleyRouter();
      for (const route of routes) {
        const store = router.register(route.path);
        store[route.method] = () => {};
      }
      const match = router.find(benchRoute.path);
      match.store[benchRoute.method]; // get handler
    });
    bench("FindMyWay", () => {
      const router = findMyWay();
      for (const route of routes) {
        router.on(route.method as HTTPMethod, route.path, () => {});
      }
      router.find(benchRoute.method as HTTPMethod, benchRoute.path);
    });
    bench("KoaTreeRouter", () => {
      const router = new KoaRouter();
      for (const route of routes) {
        router.on(route.method, route.path.replace("*", "*foo"), () => {});
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      router.find(benchRoute.method, benchRoute.path);
    });
    bench("TrekRouter", () => {
      const router = new TrekRouter();
      for (const route of routes) {
        router.add(route.method, route.path, () => {});
      }
      router.find(benchRoute.method, benchRoute.path);
    });
    bench("Panorama", async () => {
      const router = await createPanorama();
      for (const route of routes) {
        await router.addRoute({
          method: route.method,
          url: route.path,
          handler: () => {},
        });
      }
      await router.getRoute(benchRoute.path, benchRoute.method);
    });
  });
}
await run();
