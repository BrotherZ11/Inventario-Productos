import React, { useEffect, useState } from "react";

export default function GoogleSignIn({ clientId, onLogin }) {
  const [sdkReady, setSdkReady] = useState(false);

  // Cargar el script si no está presente
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.google && window.google.accounts) {
      setSdkReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setSdkReady(true);
    };
    script.onerror = () => {
      console.error("Error al cargar el script de Google Sign-In");
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Inicializar el botón de Google una vez que el SDK esté listo
  useEffect(() => {
    if (!sdkReady) return;

    function parseJwt(token) {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
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
  }, [sdkReady, clientId, onLogin]);

  return <div id="gsi-button" aria-label="Iniciar sesión con Google"></div>;
}
