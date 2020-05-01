# Charity Connect

## Available Services

###Users

Users are the people who log in to the system, and who belong to an organization

/rest/users - GET to get a list of users, POST to create or update
/rest/users/{user id} - GET a single user
/rest/users/current - GET the current user

### Organizations

Organizations are the charities that the users belong to. A user can only belong to one organization

/rest/organizations - GET to get the list of organizations, POST to create or update
/rest/organizations/{organization id} - GET a single organization

### Offers

Offers can be created by users in an organization to record the things that their charity can do for people

/rest/offers - GET to get a list of all offers for your organization, POST to create or update
/rest/offers/{offer id} - GET a single offer

### Clients

Clients record an individual or an organization who may have needs, and exist for one or more organizations

/rest/clients - GET to get a list of all clients for your organization, POST to create or update
/rest/clients/{client id} - GET a single client

### Client Needs

Clients can have multiple needs, and this records those needs and whether they have been met

/rest/client/{client id}/client_needs - GET to get a list of all clients for this client, POST to create or update
/rest/client/{client id}/client_needs/{client need id} - GET a single client need
