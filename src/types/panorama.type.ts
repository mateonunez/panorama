import type { IncomingMessage, ServerResponse } from "node:http";
import type { Http2ServerRequest, Http2ServerResponse } from "node:http2";

export enum HTTPVersion {
  HTTP1 = "http1",
  HTTP2 = "http2",
}

export type Req<V> = V extends HTTPVersion.HTTP1 ? IncomingMessage : Http2ServerRequest;
export type Res<V> = V extends HTTPVersion.HTTP1 ? ServerResponse : Http2ServerResponse;

export type Handler<V extends HTTPVersion> = (req: Req<V>, res: Res<V>, params?: Record<string, string>) => any;

export type PanoramaRouteIndex = {
  method: string;
  route: string;
};

export type PanoramaRoute<T, V extends HTTPVersion> = PanoramaRouteIndex & {
  handler: Handler<V>;
  __documentId?: string;
};
