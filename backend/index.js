// Import dependencies
const express = require("express");
const session = require("express-session");
const Keycloak = require("keycloak-connect");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Configurable backend variables
const PORT = 9000;
const FRONTEND_URL = "https://keycloak-setup-front-end.vercel.app";
const KEYCLOAK_CONFIG = {
  realm: "test",
  "auth-server-url": "https://auth.zergaw.com",
  "ssl-required": "external",
  resource: "my-client",
  "public-client": true,
  "confidential-port": 0,
};

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
const keycloak = new Keycloak({ store: memoryStore }, KEYCLOAK_CONFIG);
app.use(keycloak.middleware());

// Protected route (Requires authentication)
app.get("/profile", keycloak.protect(), (req, res) => {
  const user = req.kauth.grant.access_token.content;
  res.json({
    username: user.preferred_username,
    email: user.email,
    roles: user.realm_access.roles,
    attributes: user.attributes || {},
  });
});

// RBAC example - Only "admin" role can access
app.get("/admin", keycloak.protect("realm:admin"), (req, res) => {
  res.json({ message: "Welcome, Admin!" });
});

// ABAC example - Requires custom attribute "department=IT"
app.get("/it-only", keycloak.protect(), (req, res) => {
  const user = req.kauth.grant.access_token.content;
  if (user.attributes?.department?.includes("IT")) {
    res.json({ message: "Welcome, IT Department!" });
  } else {
    res.status(403).json({ message: "Access Denied" });
  }
});

// Login route
app.get("/login", keycloak.protect(), (req, res) => {
  res.redirect(`${FRONTEND_URL}/profile`);
});

// Logout route
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect(keycloak.logoutUrl());
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
