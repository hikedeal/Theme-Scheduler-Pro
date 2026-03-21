import { PassThrough } from "stream";
import { renderToPipeableStream } from "react-dom/server";
import { RemixServer } from "@remix-run/react";
import {
  createReadableStreamFromReadable,
  type EntryContext,
} from "@remix-run/node";
import { isbot } from "isbot";
import { addDocumentResponseHeaders } from "./shopify.server";

export const streamTimeout = 5000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  addDocumentResponseHeaders(request, responseHeaders);

  // Extend Content Security Policy for Tawk.to Chat Widget
  const csp = responseHeaders.get("Content-Security-Policy");
  if (csp) {
    let newCsp = csp;
    // Tawk.to script URLs and general wildcard
    if (newCsp.includes("script-src ")) {
      newCsp = newCsp.replace("script-src ", "script-src 'unsafe-inline' https://embed.tawk.to https://*.tawk.to ");
    }
    // Tawk.to WebSocket and API URLs
    if (newCsp.includes("connect-src ")) {
      newCsp = newCsp.replace("connect-src ", "connect-src wss://*.tawk.to https://*.tawk.to ");
    }
    // Allowed iframes for chat popups/components
    if (newCsp.includes("frame-src ")) {
      newCsp = newCsp.replace("frame-src ", "frame-src https://*.tawk.to ");
    } else {
      newCsp += "; frame-src https://*.tawk.to";
    }
    // Styling and fonts
    if (newCsp.includes("style-src ")) {
      newCsp = newCsp.replace("style-src ", "style-src 'unsafe-inline' https://*.tawk.to ");
    }
    if (newCsp.includes("font-src ")) {
      newCsp = newCsp.replace("font-src ", "font-src https://*.tawk.to ");
    }
    // Any fallback images or avatars from Tawk
    if (newCsp.includes("img-src ")) {
      newCsp = newCsp.replace("img-src ", "img-src https://*.tawk.to ");
    }
    
    responseHeaders.set("Content-Security-Policy", newCsp);
  }


  const userAgent = request.headers.get("user-agent");
  const callbackName = isbot(userAgent ?? '')
    ? "onAllReady"
    : "onShellReady";

  return new Promise((resolve, reject) => {
    const { pipe, abort } = renderToPipeableStream(
      <RemixServer
        context={remixContext}
        url={request.url}
      />,
      {
        [callbackName]: () => {
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          console.error(error);
        },
      }
    );

    // Automatically timeout the React renderer after 6 seconds, which ensures
    // React has enough time to flush down the rejected boundary contents
    setTimeout(abort, streamTimeout + 1000);
  });
}
