# NOT_FOUND Error (HTTP 404)

The `NOT_FOUND` error occurs when a requested resource, route, or page could not be found by the system. This might happen if the resource has been moved, deleted, or if there is a typo in the URL.

## Typical Causes in CVFolio

1. **Incorrect URL Paths**:
   - Trying to access an API endpoint that does not exist (e.g., `/api/invalid-route`).
   - Typing a wrong URL in the client-side router (e.g., trying to visit `/docs/errors/not_found` instead of `/docs/errors/not_found.md`).

2. **Frontend Page Routing**:
   - Accessing a non-existent frontend route in the Next.js application that does not have a corresponding file in the `client/app/` directory.

3. **Static File Server Misses**:
   - Accessing an image or upload in `/uploads/` that was never uploaded or has been deleted from the server disk.

## How to Resolve

- **Double-check the URL**: Review the requested URL path for any typos or spelling mistakes.
- **API Endpoint Mapping**: Consult the API reference in the [/llms.txt](/llms.txt) to verify that you are hitting the correct endpoint and using the appropriate HTTP method (GET, POST, PUT, DELETE).
- **Check Server Status**: Verify that the Express server is up and listening on the designated port (default: 4000).
- **Check Client Routing**: Ensure that the path matches one of the defined page components in `client/app/`.
