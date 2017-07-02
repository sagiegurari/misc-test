
use std::path::Path;

fn test(base_path: &str, file_name: &str) {
    let file_path = Path::new(base_path).join(file_name);

    if file_path.exists() {
        match file_path.canonicalize() {
            Ok(value) => println!("file found: {:?}", value),
            Err(error) => panic!("Unable to get file path for base path: {} file name: {} error: {}", base_path, file_name, error),
        };
    } else {
        println!("file not found!!!");
    }
}

fn main() {
    test(".", "Cargo.toml");
    test("..", "test.txt");
}
