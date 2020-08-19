#[derive(Debug, Clone, PartialEq)]
enum SomeType {
    A,
    B,
    C,
}

fn main() {
    let mut some_type = SomeType::A;

    println!("current: {:#?}", &some_type);

    some_type = match some_type {
        SomeType::A => SomeType::B,
        _ => SomeType::C,
    };

    println!("updated to: {:#?}", &some_type);
}
