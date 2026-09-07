import { invoke } from '@tauri-apps/api/core'

import type { AppResult, CommandError } from '../types'

type InvokeArgs = Record<string, unknown>

const FALLBACK_COMMAND_ERROR: CommandError = {
  code: 'tauriInvokeFailed',
  message: 'Tauri command failed with an unknown error.',
}

function isCommandError(value: unknown): value is CommandError {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  // Object indexing is only used after the runtime object/null guard above.
  const candidate = value as Record<string, unknown>

  return typeof candidate.code === 'string' && typeof candidate.message === 'string'
}

function parseCommandError(error: unknown): CommandError {
  if (isCommandError(error)) {
    return error
  }

  if (typeof error !== 'string') {
    return FALLBACK_COMMAND_ERROR
  }

  try {
    const parsedError: unknown = JSON.parse(error)

    if (isCommandError(parsedError)) {
      return parsedError
    }
  } catch {
    return {
      code: 'tauriInvokeFailed',
      message: error,
    }
  }

  return {
    code: 'tauriInvokeFailed',
    message: error,
  }
}

// Invokes a Tauri command and converts rejected values into the shared result contract.
export async function invokeCommand<ResponseValue>(
  commandName: string,
  args?: InvokeArgs,
): Promise<AppResult<ResponseValue>> {
  try {
    const value = await invoke<ResponseValue>(commandName, args)

    return {
      isOk: true,
      value,
    }
  } catch (error: unknown) {
    return {
      isOk: false,
      error: parseCommandError(error),
    }
  }
}
