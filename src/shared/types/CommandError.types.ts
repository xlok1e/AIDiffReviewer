// Tauri error codes
export type CommandErrorCode =
  | 'internalError'
  | 'invalidRepositoryPath'
  | 'invalidFilePath'
  | 'invalidHunkId'
  | 'invalidHunkHash'
  | 'tauriInvokeFailed';

export interface CommandError {
  code: CommandErrorCode;
  message: string;
}

// Result pattern
export type AppResult<SuccessValue, ErrorValue = CommandError> =
  { isOk: true; value: SuccessValue } | { isOk: false; error: ErrorValue };
