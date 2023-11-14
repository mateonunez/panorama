import { createPanorama } from '../../../src/index.ts';
import { routes, handler } from './tool.mts';

const name = 'panorama';
const router = await createPanorama();

for (const route of routes) {
  router.addRoute({
    method: route.method,
    url: route.path,
    handler,
  });
}

export const panoramaRouter = {
  name,
  match: (route) => {
    router.getRoute(route.path, route.method);
  },
};
