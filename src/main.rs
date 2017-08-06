
fn main() {
    println!("test");
}


#[cfg(test)]
mod test {
    #[test]
    fn distance_test() {
        assert!(true);
    }
}
