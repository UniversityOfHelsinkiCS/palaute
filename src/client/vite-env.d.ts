interface ImportMetaEnv {
  readonly VITE_VERSION?: string
  readonly REACT_APP_GIT_SHA?: string
  readonly REACT_APP_STAGING?: string
  readonly REACT_APP_E2E?: string
  readonly BASE_PATH: string
}

declare const CONFIG: unknown
