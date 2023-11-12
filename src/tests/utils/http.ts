/* c8 ignore start */
import http from "node:http";
import { URL } from "node:url";

interface HttpResponse<T = any> {
  body: T;
  statusCode: number;
}

async function readResponseBody(res: http.IncomingMessage): Promise<string> {
  let body = "";
  for await (const chunk of res) {
    body += chunk;
  }
  return body;
}

async function httpRequest<T>(url: string, options: http.RequestOptions, data?: any): Promise<HttpResponse<T>> {
  return new Promise((resolve, reject) => {
    const req = http
      .request(new URL(url), options, async (res) => {
        try {
          const body = await readResponseBody(res);
          try {
            const parsedBody = JSON.parse(body);
            resolve({ body: parsedBody, statusCode: res.statusCode ?? 0 });
          } catch (jsonError) {
            reject(new Error(`Error parsing JSON: ${(jsonError as Error).message}`));
          }
        } catch (error) {
          reject(error);
        }
      })
      .on("error", reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function httpGet<T>(url: string): Promise<HttpResponse<T>> {
  return httpRequest<T>(url, { method: "GET" });
}

async function httpPost<T>(url: string, data: any): Promise<HttpResponse<T>> {
  return httpRequest<T>(
    url,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
    data,
  );
}

export { httpGet, httpPost };
/* c8 ignore stop */
