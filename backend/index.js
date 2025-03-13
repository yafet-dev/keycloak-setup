const express = require("express");
const session = require("express-session");
const Keycloak = require("keycloak-connect");
const cors = require("cors");

const app = express();

// Define the front-end and back-end URLs
const FRONTEND_URL = "https://keycloak-setup-front-end.vercel.app";
const BACKEND_URL = "https://keycloak-setup-api.vercel.app";

app.use(cors());
app.use(express.json());

// Session setup
const memoryStore = new session.MemoryStore();
app.use(
  session({
    secret: "mysecret",
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  })
);

// Keycloak setup
const keycloak = new Keycloak(
  { store: memoryStore },
  {
    realm: "test",
    "auth-server-url": "https://auth.zergaw.com",
    "ssl-required": "external",
    resource: "my-client",
    "public-client": true,
    "confidential-port": 0,
  }
);
app.use(keycloak.middleware());

// Protected route (Requires authentication)
app.get("/profile", keycloak.protect(), (req, res) => {
  const user = req.kauth.grant.access_token.content;

  // Extract realm roles
  const realmRoles = user.realm_access?.roles || [];

  // Extract client roles
  const clientRoles = user.resource_access?.["my-client"]?.roles || [];

  // Extract attributes
  const attributes = user.attributes || {};
  attributes.department = user.department || "Not Assigned";

  res.json({
    realmRoles,
    clientRoles,
    attributes,
  });
});

// RBAC example - Only "admin" role can access
app.get("/admin", keycloak.protect(), (req, res) => {
  const user = req.kauth.grant.access_token.content;

  // Check if the user has the "admin" role under the "my-client" client
  const clientRoles = user.resource_access?.["my-client"]?.roles || [];
  if (!clientRoles.includes("admin")) {
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  }

  res.json({ message: "Welcome, Admin!" });
});

// ABAC example - Requires custom attribute "department=IT"
app.get("/it-only", keycloak.protect(), (req, res) => {
  const user = req.kauth.grant.access_token.content;
  const department = user.department || user.attributes?.department;

  if (department === "IT") {
    res.json({ message: "Welcome, IT Department!" });
  } else {
    res.status(403).json({ message: "Access Denied" });
  }
});

// Login route - Redirect to front-end /profile after authentication
app.get("/login", keycloak.protect(), (req, res) => {
  res.redirect(`/profile`); // Redirect to front-end /profile
});

// Logout route - Redirect to front-end home page after logout
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect(FRONTEND_URL); // Redirect to front-end home page
});

app.listen(9000, () => console.log(`Server running on ${BACKEND_URL}`));
