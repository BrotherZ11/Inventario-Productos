// // Config — sustituye por tus valores
// export const SHEET_ID = "16EOSu2XqTxGMDxl05zeS61Qfsi3cIMwYgjcsaGnGI3M";
// export const SHEET_NAME = "Amazon Vine";

// // Google OAuth 2.0 Client ID (para Google Sign-In)
// export const GOOGLE_CLIENT_ID = "59175635297-n0kjrvuu0ejccf3l857n5mmknn7iq9fo.apps.googleusercontent.com";

export const SHEET_ID = process.env.REACT_APP_SHEET_ID;
export const SHEET_NAME = process.env.REACT_APP_SHEET_NAME;
export const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
console.log("SHEET_ID:", process.env.REACT_APP_SHEET_ID);
console.log("SHEET_NAME:", process.env.REACT_APP_SHEET_NAME);
console.log("GOOGLE_CLIENT_ID:", process.env.REACT_APP_GOOGLE_CLIENT_ID);
