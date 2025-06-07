import { createRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "./core";

// Export routes for Next App Router
const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});

export { GET, POST };
