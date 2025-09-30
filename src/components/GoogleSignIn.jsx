import React, { useEffect } from "react";

export default function GoogleSignIn({ clientId, onLogin }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.google) return;

    function parseJwt(token) {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      return JSON.parse(jsonPayload);
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        try {
          const payload = parseJwt(response.credential);
          const user = {
            sub: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
          };
          onLogin(user);
        } catch (err) {
          console.error("Error decoding Google credential", err);
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    window.google.accounts.id.renderButton(
      document.getElementById("gsi-button"),
      { theme: "outline", size: "large", width: "220" }
    );
  }, [clientId, onLogin]);

  return <div id="gsi-button" aria-label="Iniciar sesión con Google"></div>;
}
