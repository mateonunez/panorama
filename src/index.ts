import { create, insert, update } from "@orama/orama";
import type { Orama, Result } from "@orama/orama";
import { createOramaCache } from "orama-cache";
import type { HTTPVersion, PanoramaRoute, PanoramaRouteIndex, Req, Res } from "./types/panorama.type.js";

const panoramaRouteIndexSchema = {
  method: "string",
  url: "string",
  params: "string[]",
} as const;

interface IPanorama<T, V extends HTTPVersion> {
  addRoute(route: PanoramaRoute<T, V>): Promise<void>;
  getRoute(route: string, methodName?: string, segments?: Array<string>): Promise<PanoramaRoute<T, V>>;
  lookup(req: Req<V>, res: Res<V>): Promise<void>;
  init(): Promise<void>;
}

class Panorama<T extends Response, V extends HTTPVersion.HTTP1> implements IPanorama<T, V> {
  #routes!: Map<string, PanoramaRoute<T, V>>;
  #orama!: Orama<typeof panoramaRouteIndexSchema>;
  #oramaCache!: ReturnType<typeof createOramaCache>;
  #rootDocumentId!: string;
  #initialized = false;

  async init() {
    this.#routes = new Map();
    this.#orama = await create({
      schema: panoramaRouteIndexSchema,
    });
    this.#oramaCache = createOramaCache(this.#orama);

    const rootIndex = this.#generateIndex({
      method: "GET",
      url: "/",
      handler: () => true,
    });
    this.#rootDocumentId = await insert(this.#orama, rootIndex);
    this.#initialized = true;
  }

  async addRoute(route: PanoramaRoute<T, V>): Promise<void> {
    if (!this.#initialized) {
      throw new Error("Panorama not initialized");
    }

    if (route.__documentId && this.#routes.has(route.__documentId)) {
      throw new Error(`route ${route.__documentId} already exists`);
    }

    if (this.#isRootUrl(route.url)) {
      route.__documentId = this.#rootDocumentId;
      await update(this.#orama, this.#rootDocumentId, route);
      this.#routes.set(this.#rootDocumentId, route);
      return;
    }

    const index = this.#generateIndex(route);
    const documentId = await insert(this.#orama, index);

    this.#routes.set(documentId, {
      ...route,
      __documentId: documentId,
    });
  }

  async getRoute(routeName?: string, method = "GET", segments: Array<string> = []): Promise<PanoramaRoute<T, V>> {
    if (!this.#initialized) {
      throw new Error("Panorama not initialized");
    }

    if (routeName === undefined) {
      throw new Error("route name is undefined");
    }

    const results = await this.#oramaCache.search({
      term: routeName,
    });

    const hits = results.hits;
    let route: PanoramaRoute<T, V> | undefined;
    if (hits.length === 0) {
      route = this.#routes.get(this.#rootDocumentId);
    } else if (hits.length === 1) {
      const routeDocumentId = hits[0].id;
      route = this.#routes.get(routeDocumentId);
    } else {
      /* c8 ignore next */
      const nested = segments;
      const routeDocumentId = this.#findFromHits(hits, routeName, nested, method);
      route = this.#routes.get(routeDocumentId);
    }

    /* c8 ignore next 3 */
    if (route === undefined) {
      throw new Error(`route ${routeName} not found`);
    }

    return route;
  }

  async lookup(req: Req<V>, res: Res<V>): Promise<void> {
    if (!this.#initialized) {
      throw new Error("Panorama not initialized");
    }

    /* c8 ignore next */
    const url = req.url ?? "/";
    const segments = this.#computeNestedRoutes(url);
    const route = await this.getRoute(url, req.method, segments);
    const params = this.#computeParams(route.url, url);
    route.handler(req, res, params);
  }

  get routes() {
    return this.#routes;
  }

  get orama() {
    return this.#orama;
  }

  #generateIndex(route: PanoramaRoute<T, V>): PanoramaRouteIndex {
    const segments = this.#computeNestedRoutes(route.url);

    const index = {
      method: route.method,
      url: route.url,
      segments: segments,
    };

    return index;
  }

  #computeParams(route: string, url?: string): Record<string, string> {
    const params: Record<string, string> = {};
    const routeParts = route.split("/");
    /* c8 ignore next */
    const urlParts = url?.split("/") ?? [];

    for (let i = 0; i < routeParts.length; i++) {
      const routePart = routeParts[i];
      const urlPart = urlParts[i];

      if (routePart.startsWith(":")) {
        const paramName = routePart.slice(1);
        params[paramName] = urlPart;
      }
    }

    return params;
  }

  #computeNestedRoutes(route: string): string[] {
    const segments = route.split("/");
    const results: string[] = [];

    const j = 0;
    for (let i = 1; i < segments.length; i++) {
      let segment = segments[i];
      if (segment.length > 0) {
        if (segment.startsWith(":")) {
          segment = segment.slice(1);
        }
        results[j] = segment;
      }
    }

    return results;
  }

  #isRootUrl(url: string): boolean {
    return url === "/";
  }

  #findFromHits(hits: Result<PanoramaRouteIndex>[], routeName: string, segments: Array<string>, method: string): string {
    const filteredHits = [];
    let j = 0;
    for (let i = 0; i < hits.length; i++) {
      const hit = hits[i];
      if (hit.document.method === method) {
        filteredHits[j] = hit;
        j++;
      }
    }

    let route;
    if (segments.length > 0) {
      for (let i = 0; i < filteredHits.length; i++) {
        if (filteredHits[i].document.segments?.length === segments.length) {
          route = filteredHits[i];
          break;
        }
      }
    } else {
      for (let i = 0; i < filteredHits.length; i++) {
        if (filteredHits[i].document.url === routeName) {
          route = filteredHits[i];
          break;
        }
      }
    }

    if (!route) {
      return filteredHits[0].id;
    }

    return route.id;
  }
}

async function createPanorama<T extends Response, V extends HTTPVersion.HTTP1>(): Promise<Panorama<T, V>> {
  const panorama = new Panorama();
  await panorama.init();
  return panorama;
}

export { createPanorama, Panorama };
