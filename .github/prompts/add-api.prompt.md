# Add GET API calls for page static data replacement

For a given page on the web project you are to create a new API call or calls to replace any static data being used on the page. 

This should include:
- Creating the necessary API endpoint(s) in the API functions project
- Updating the web project to use the new API endpoint(s) instead of static data files.
- Binding this to the page in question on the UI.
- Should not do any POST, PUT, DELETE operations, only GET operations are required for this task.

## API Implementation Guidance

- All APIs build built should be annoted with OpenAPI attributes for documentation generation of swagger.
- Ensure that the API endpoint follows RESTful conventions.
- Do not overly throw try catch behaviour, let the global error handler take care of it but return NotFound or BadRequest results as appropriate.
- Ensure that endpoints are authenticated and authorized as per the existing codebase conventions.
- Keep the functions lean and hand off to Mediator handlers for functionality.
  - Ensure that handler as in a folder for the area e.g. Teams, Clubs, AgeGroups, etc and a folder for the action name e.g. GetByAzureId.
  - Ensure that all DB queries are executed by sending SQL strings to the context and mapping the results to DTOs.
  - Ensure all DB query models and Query Models are in the same file as the handler
  - Ensure that all DTOs are in a single class in a DTOs folder for the action folder.

## Client Implementation

- The web project should then use these APIs for the consumption of the data instead of static data files.
- Models should be created or updated as necessary to support the new API data structures.
- Ensure that loading states and error handling are properly managed in the UI.
- When components are loading data from the API, ensure that appropriate loading indicators are shown in the relevant panel.
- Do not take over the whole page when loading.
- Standardize per-page loading UX across all pages: use skeleton placeholders within each section (e.g., title, stats, lists, cards) rather than global spinners or full-page loaders.

