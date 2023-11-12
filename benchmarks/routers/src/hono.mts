// import { RegExpRouter } from '../../../src/router/reg-exp-router/index.ts'
// import { TrieRouter } from '../../../src/router/trie-router/index.ts'
// import type { Router } from '../../../src/router.ts'
import { RegExpRouter } from 'hono/router/reg-exp-router'
import { TrieRouter } from 'hono/router/trie-router'
import type { RouterInterface } from './tool.mts'
import { routes, handler } from './tool.mts'

const createHonoRouter = (name: string, router: any): RouterInterface => {
  for (const route of routes) {
    router.add(route.method, route.path, handler)
  }
  return {
    name: `Hono ${name}`,
    match: (route) => {
      router.match(route.method, route.path)
    },
  }
}

export const regExpRouter = createHonoRouter('RegExpRouter', new RegExpRouter())
export const trieRouter = createHonoRouter('TrieRouter', new TrieRouter())
