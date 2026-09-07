fn main() {
    if let Err(error) = ai_diff_reviewer_lib::run_application() {
        eprintln!("failed to start AI Diff Reviewer: {error}");
        std::process::exit(1);
    }
}
