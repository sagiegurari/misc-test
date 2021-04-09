use duckscript::runner;
use duckscript::types::runtime::Context;
use duckscriptsdk;

fn main() {
    let mut context = Context::new();
    duckscriptsdk::load(&mut context.commands)?;
    runner::run_script(
        r#"
    echo hello world
    "#,
        context,
    )
    .unwrap();
}
