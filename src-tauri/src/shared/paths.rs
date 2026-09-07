use std::path::{Component, Path, PathBuf};

use super::errors::{fail_command, CommandErrorCode, CommandResult};
use super::types::{RepositoryFilePath, RepositoryPath};

// Normalizes a selected repository path without touching the file system.
pub fn normalize_repository_path(path: &str) -> CommandResult<RepositoryPath> {
    let trimmed_path = path.trim();

    if trimmed_path.is_empty() {
        return fail_command(
            CommandErrorCode::InvalidRepositoryPath,
            "Repository path cannot be empty.",
        );
    }

    let path_value = Path::new(trimmed_path);

    if !path_value.is_absolute() {
        return fail_command(
            CommandErrorCode::InvalidRepositoryPath,
            "Repository path must be absolute.",
        );
    }

    let normalized_path = normalize_absolute_path(path_value)?;

    Ok(RepositoryPath::new(path_to_string(&normalized_path)))
}

// Normalizes a repository-relative file path and rejects traversal outside the repository.
pub fn normalize_repository_file_path(path: &str) -> CommandResult<RepositoryFilePath> {
    let trimmed_path = path.trim();

    if trimmed_path.is_empty() {
        return fail_command(
            CommandErrorCode::InvalidFilePath,
            "File path cannot be empty.",
        );
    }

    let path_value = Path::new(trimmed_path);

    if path_value.is_absolute() {
        return fail_command(
            CommandErrorCode::InvalidFilePath,
            "File path must be relative to the repository.",
        );
    }

    let normalized_path = normalize_relative_path(path_value)?;

    Ok(RepositoryFilePath::new(path_to_string(&normalized_path)))
}

fn normalize_absolute_path(path: &Path) -> CommandResult<PathBuf> {
    let mut normalized_path = PathBuf::new();

    for component in path.components() {
        match component {
            Component::Prefix(prefix) => normalized_path.push(prefix.as_os_str()),
            Component::RootDir => normalized_path.push(component.as_os_str()),
            Component::CurDir => {}
            Component::ParentDir => {
                let did_pop = normalized_path.pop();

                if !did_pop {
                    return fail_command(
                        CommandErrorCode::InvalidRepositoryPath,
                        "Repository path cannot traverse above the file system root.",
                    );
                }
            }
            Component::Normal(part) => normalized_path.push(part),
        }
    }

    Ok(normalized_path)
}

fn normalize_relative_path(path: &Path) -> CommandResult<PathBuf> {
    let mut normalized_parts: Vec<Component<'_>> = Vec::new();

    for component in path.components() {
        match component {
            Component::CurDir => {}
            Component::Normal(_) => normalized_parts.push(component),
            Component::ParentDir => {
                if normalized_parts.pop().is_none() {
                    return fail_command(
                        CommandErrorCode::InvalidFilePath,
                        "File path cannot traverse outside the repository.",
                    );
                }
            }
            Component::Prefix(_) | Component::RootDir => {
                return fail_command(
                    CommandErrorCode::InvalidFilePath,
                    "File path must be relative to the repository.",
                );
            }
        }
    }

    if normalized_parts.is_empty() {
        return fail_command(
            CommandErrorCode::InvalidFilePath,
            "File path must point to a file inside the repository.",
        );
    }

    Ok(components_to_path(normalized_parts))
}

fn components_to_path(components: Vec<Component<'_>>) -> PathBuf {
    components
        .into_iter()
        .fold(PathBuf::new(), |mut path, component| {
            path.push(component.as_os_str());
            path
        })
}

fn path_to_string(path: &Path) -> String {
    path.to_string_lossy().into_owned()
}

#[cfg(test)]
mod tests {
    use super::{normalize_repository_file_path, normalize_repository_path};

    #[test]
    fn normalizes_absolute_repository_path_segments() {
        let normalized_path = normalize_repository_path("/workspace/../repo/./project")
            .expect("repository path should normalize");

        assert_eq!(normalized_path.as_str(), "/repo/project");
    }

    #[test]
    fn rejects_relative_repository_path() {
        let error = normalize_repository_path("repo/project")
            .expect_err("relative repository path should fail");

        assert!(error.contains("Repository path must be absolute."));
    }

    #[test]
    fn rejects_empty_repository_path() {
        let error =
            normalize_repository_path("   ").expect_err("empty repository path should fail");

        assert!(error.contains("Repository path cannot be empty."));
    }

    #[test]
    fn normalizes_relative_file_path_segments() {
        let normalized_path = normalize_repository_file_path("./src/../README.md")
            .expect("file path should normalize");

        assert_eq!(normalized_path.as_str(), "README.md");
    }

    #[test]
    fn rejects_absolute_file_path() {
        let error = normalize_repository_file_path("/etc/passwd")
            .expect_err("absolute file path should fail");

        assert!(error.contains("File path must be relative to the repository."));
    }

    #[test]
    fn rejects_file_path_traversal_above_repository() {
        let error = normalize_repository_file_path("../secret.txt")
            .expect_err("path traversal should fail");

        assert!(error.contains("File path cannot traverse outside the repository."));
    }

    #[test]
    fn rejects_nested_file_path_traversal_above_repository() {
        let error = normalize_repository_file_path("src/../../secret.txt")
            .expect_err("nested path traversal should fail");

        assert!(error.contains("File path cannot traverse outside the repository."));
    }

    #[test]
    fn rejects_file_path_without_target() {
        let error = normalize_repository_file_path("./src/..")
            .expect_err("path without file target should fail");

        assert!(error.contains("File path must point to a file inside the repository."));
    }
}
