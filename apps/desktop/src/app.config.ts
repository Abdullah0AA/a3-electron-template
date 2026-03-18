export const isDevelopment = Boolean(process.env.VITE_DEV_SERVER_URL);

export const APP_NAME = "A3 App";
export const APP_ID = "com.a3.app";
export const DESKTOP_SCHEME = "a3";
export const USER_DATA_DIR = "a3-app";
export const APP_DISPLAY_NAME = isDevelopment ? `${APP_NAME} (Dev)` : APP_NAME;
export const USER_DATA_DIR_NAME = isDevelopment
  ? `${USER_DATA_DIR}-dev`
  : USER_DATA_DIR;
