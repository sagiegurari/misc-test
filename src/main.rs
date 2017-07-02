
use std::path::Path;

fn main() {
    let file_path = Path::new(".").join("Cargo.toml");

    if file_path.exists() {
        match file_path.canonicalize() {
            Ok(value) => {
                println!("file found: {:?}", value);
                
                let parent_path = file_path.parent().unwrap().to_str().unwrap();
                
                let parent_file = Path::new(parent_path).join("../test.txt");
                
                if parent_file.exists() {
                    match parent_file.canonicalize() {
                        Ok(value) => println!("parent file found: {:?}", value),
                        Err(error) => panic!("Unable to get file path for base path: {} file name: test.txt error: {}", parent_path, error),
                    };
                } else {
                    println!("parent file not found!!!");
                }
            }
            Err(error) => panic!("Unable to get file path for base path: . file name: cargo toml error: {}", error),
        };
    } else {
        println!("file not found!!!");
    }
}
