import { Orama, create, insert, search } from "@orama/orama";
import type { HTTPVersion, PanoramaRoute, PanoramaRouteIndex, Req, Res } from "./types/panorama.type";

const panoramaRouteIndexSchema = {
  method: "string",
  route: "string",
} as const;

interface IPanorama<T, V extends HTTPVersion> {
  addRoute(route: PanoramaRoute<T, V>): Promise<void>;
  getRoute(route: string): Promise<PanoramaRoute<T, V>>;
  lookup(req: Req<V>, res: Res<V>): Promise<void>;
}

class Panorama<T extends Response, V extends HTTPVersion.HTTP1> implements IPanorama<T, V> {
  #routes!: Map<string, PanoramaRoute<T, V>>;
  #indexes!: Map<string, PanoramaRouteIndex>;
  #orama!: Orama<typeof panoramaRouteIndexSchema>;

  async init() {
    this.#routes = new Map();
    this.#indexes = new Map();
    this.#orama = await create({ schema: panoramaRouteIndexSchema });
  }

  async addRoute(route: PanoramaRoute<T, V>): Promise<void> {
    if (route.__documentId && this.#routes.has(route.__documentId)) {
      throw new Error(`route ${route.__documentId} already exists`);
    }

    const index = this.#generateIndex(route);
    const documentId = await insert(this.#orama, index);

    this.#routes.set(documentId, {
      ...route,
      __documentId: documentId,
    });
  }

  async getRoute(routeName?: string): Promise<PanoramaRoute<T, V>> {
    if (routeName === undefined) {
      throw new Error("route name is undefined");
    }

    const results = await search(this.#orama, { term: routeName });
    if (results.hits.length === 0) {
      throw new Error(`route ${routeName} not found`);
    }

    const routeId = results.hits[0].id;
    const route = this.#routes.get(routeId);
    /* c8 ignore next 3 */
    if (route === undefined) {
      throw new Error(`route ${routeName} not found`);
    }

    return route;
  }

  async lookup(req: Req<V>, res: Res<V>): Promise<void> {
    const route = await this.getRoute(req.url);
    route.handler(req, res);
  }

  get routes() {
    return this.#routes;
  }

  get indexes() {
    return this.#indexes;
  }

  get orama() {
    return this.#orama;
  }

  #generateIndex(route: PanoramaRoute<T, V>): PanoramaRouteIndex {
    const index = {
      method: route.method,
      route: route.route,
    };

    return index as PanoramaRouteIndex;
  }
}

export default Panorama;
