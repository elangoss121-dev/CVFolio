# RESOURCE_NOT_FOUND Error (HTTP 404)

The `RESOURCE_NOT_FOUND` error indicates that a requested resource is not available or cannot be found. This error typically arises when a request is made to an endpoint or resource that does not exist or has been removed from the database.

## Typical Causes in CVFolio

1. **User Profile Missing**:
   - Querying a user by ID or email that doesn't exist in the database or the in-memory fallback store.
   
2. **Resume Missing**:
   - Fetching, updating, or deleting a resume using an ID that is not present in the store.

3. **Portfolio Slug Not Found**:
   - Trying to access a public portfolio page using a slug that is not associated with any user's portfolio, or accessing a portfolio that is not marked as published (`isPublished: false`).

4. **Database Connection Interruption**:
   - The backend was restarted, causing in-memory fallback storage to clear, making previously created resources unavailable.

## How to Resolve

- **Verify Resource Identifier**: Check that the ID (MongoDB ObjectId or in-memory ID) or slug is completely correct and exists in your environment.
- **Publish Status**: Ensure the portfolio is set to `isPublished: true` if you are trying to view it through the public route (`/api/portfolios/:slug`).
- **Database Consistency**: If running with the in-memory fallback store instead of a persistent MongoDB instance, note that restarting the backend server will wipe all user, resume, and portfolio records. Configure `MONGODB_URI` in `server/.env` to persist data.
- **Audit Deletion**: Confirm the resource was not deleted by a prior action.
