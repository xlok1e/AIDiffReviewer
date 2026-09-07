use serde::Serialize;
use std::fmt::Display;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CommandErrorCode {
    InternalError,
    InvalidRepositoryPath,
    InvalidFilePath,
    InvalidHunkId,
    InvalidHunkHash,
}

impl CommandErrorCode {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::InternalError => "internalError",
            Self::InvalidRepositoryPath => "invalidRepositoryPath",
            Self::InvalidFilePath => "invalidFilePath",
            Self::InvalidHunkId => "invalidHunkId",
            Self::InvalidHunkHash => "invalidHunkHash",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct CommandError {
    pub code: String,
    pub message: String,
}

pub type CommandResult<SuccessValue> = Result<SuccessValue, String>;

// Builds the shared command error payload returned through Tauri Result errors.
pub fn create_command_error(code: CommandErrorCode, message: impl Into<String>) -> CommandError {
    CommandError {
        code: code.as_str().to_string(),
        message: message.into(),
    }
}

// Serializes command errors while preserving a human-readable fallback message.
pub fn serialize_command_error(error: CommandError) -> String {
    let fallback_message = error.message.clone();

    serde_json::to_string(&error).unwrap_or(fallback_message)
}

// Converts internal errors into the shared Tauri command result shape.
pub fn map_command_error<SuccessValue, ErrorValue: Display>(
    result: Result<SuccessValue, ErrorValue>,
    code: CommandErrorCode,
) -> CommandResult<SuccessValue> {
    result.map_err(|error| serialize_command_error(create_command_error(code, error.to_string())))
}

// Creates a failed command result from a typed code and a user-facing message.
pub fn fail_command<SuccessValue>(
    code: CommandErrorCode,
    message: impl Into<String>,
) -> CommandResult<SuccessValue> {
    Err(serialize_command_error(create_command_error(code, message)))
}
