use super::errors::{fail_command, CommandErrorCode, CommandResult};

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct RepositoryPath(String);

impl RepositoryPath {
    pub(crate) fn new(value: String) -> Self {
        Self(value)
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct RepositoryFilePath(String);

impl RepositoryFilePath {
    pub(crate) fn new(value: String) -> Self {
        Self(value)
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct HunkId(String);

impl HunkId {
    fn new(value: String) -> Self {
        Self(value)
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct HunkHash(String);

impl HunkHash {
    fn new(value: String) -> Self {
        Self(value)
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

// Creates a typed hunk id after rejecting empty identifiers.
pub fn create_hunk_id(value: &str) -> CommandResult<HunkId> {
    let normalized_value = value.trim();

    if normalized_value.is_empty() {
        return fail_command(CommandErrorCode::InvalidHunkId, "Hunk id cannot be empty.");
    }

    Ok(HunkId::new(normalized_value.to_string()))
}

// Creates a typed hunk hash after rejecting empty hashes.
pub fn create_hunk_hash(value: &str) -> CommandResult<HunkHash> {
    let normalized_value = value.trim();

    if normalized_value.is_empty() {
        return fail_command(
            CommandErrorCode::InvalidHunkHash,
            "Hunk hash cannot be empty.",
        );
    }

    Ok(HunkHash::new(normalized_value.to_string()))
}

#[cfg(test)]
mod tests {
    use super::{create_hunk_hash, create_hunk_id};

    #[test]
    fn creates_hunk_id_from_non_empty_value() {
        let hunk_id = create_hunk_id(" file.ts:1 ").expect("hunk id should be created");

        assert_eq!(hunk_id.as_str(), "file.ts:1");
    }

    #[test]
    fn rejects_empty_hunk_id() {
        let error = create_hunk_id(" ").expect_err("empty hunk id should fail");

        assert!(error.contains("Hunk id cannot be empty."));
    }

    #[test]
    fn creates_hunk_hash_from_non_empty_value() {
        let hunk_hash = create_hunk_hash(" abc123 ").expect("hunk hash should be created");

        assert_eq!(hunk_hash.as_str(), "abc123");
    }

    #[test]
    fn rejects_empty_hunk_hash() {
        let error = create_hunk_hash(" ").expect_err("empty hunk hash should fail");

        assert!(error.contains("Hunk hash cannot be empty."));
    }
}
