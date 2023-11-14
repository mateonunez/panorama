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
  #routes!: Record<string, PanoramaRoute<T, V>>;
  #orama!: Orama<typeof panoramaRouteIndexSchema>;
  #oramaCache!: ReturnType<typeof createOramaCache>;
  #rootDocumentId!: string;

  async init() {
    this.#routes = {};
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
 }

  async addRoute(route: PanoramaRoute<T, V>): Promise<void> {
    if (route.__documentId && this.#routes[route.__documentId]) {
      throw new Error(`route ${route.__documentId} already exists`);
    }

    if (this.#isRootUrl(route.url)) {
      route.__documentId = this.#rootDocumentId;
      await update(this.#orama, this.#rootDocumentId, route);
      this.#routes[this.#rootDocumentId] = route;
      return;
    }

    const index = this.#generateIndex(route);
    const documentId = await insert(this.#orama, index);

    this.#routes[documentId] = {
      ...route,
      __documentId: documentId,
    };
  }

  async getRoute(routeName = "/", method = "GET", segments: Array<string> = []): Promise<PanoramaRoute<T, V>> {
    const results = await this.#oramaCache.search({
      term: routeName,
    });

    const hits = results.hits;
    let routeId = this.#rootDocumentId;
    if (hits.length === 1) {
      routeId = hits[0].id;
    } else if (hits.length > 1) {
      routeId = this.#findFromHits(hits, routeName, segments, method);
    }

    return this.#routes[routeId];
  }

  async lookup(req: Req<V>, res: Res<V>): Promise<void> {
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

  #computeParams(route: string, url = "/"): Record<string, string> {
    const params: Record<string, string> = {};
    const routeParts = route.split("/");
    /* c8 ignore next */
    const urlParts = url.split("/");
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].indexOf(":") === 0) {
        params[routeParts[i].slice(1)] = urlParts[i];
      }
    }

    return params;
  }

  #computeNestedRoutes(route: string): string[] {
    const segments = route.split("/");
    const results: string[] = [];
    let j = 0;
    for (let i = 1; i < segments.length; i++) {
      if (segments[i].length > 0) {
        if (segments[i].indexOf(":") === 0) {
          segments[i] = segments[i].slice(1);
        }
        results[j] = segments[i];
        j++;
      }
    }

    return results;
  }

  #isRootUrl(url: string): boolean {
    return url === "/" && url.length === 1 || url === "";
  }

  #findFromHits(hits: Result<PanoramaRouteIndex>[], routeName: string, _segments: Array<string>, method: string): string {
    const segments = this.#computeNestedRoutes(routeName);
    const segmentsLength = segments.length;
    let routeId = this.#rootDocumentId;
    for (let i = 0; i < hits.length; i++) {
      if (hits[i].document.method.indexOf(method) === 0 && hits[i].document.segments?.length === segmentsLength) {
        routeId = hits[i].id;
        break;
      }
    }

    return routeId;
  }
}

async function createPanorama<T extends Response, V extends HTTPVersion.HTTP1>(): Promise<Panorama<T, V>> {
  const panorama = new Panorama();
  await panorama.init();
  return panorama;
}

export { createPanorama, Panorama };
