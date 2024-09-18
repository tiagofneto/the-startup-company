use dep::compressed_string::FieldCompressedString;
use dep::protocol_types::traits::{Serialize, Deserialize};

struct Company {
    name: FieldCompressedString,
    handle: FieldCompressedString,
    email: FieldCompressedString,
    director: FieldCompressedString,
    total_shares: U128
}

impl Serialize<5> for Company {
    fn serialize(self) -> [Field; 5] {
        [self.name.serialize()[0], self.handle.serialize()[0], self.email.serialize()[0], self.director.serialize()[0], self.total_shares.serialize()[0]]
    }
}

impl Deserialize<5> for Company {
    fn deserialize(fields: [Field; 5]) -> Self {
        Self { 
            name: FieldCompressedString::from_field(fields[0]), 
            handle: FieldCompressedString::from_field(fields[1]), 
            email: FieldCompressedString::from_field(fields[2]), 
            director: FieldCompressedString::from_field(fields[3]), 
            total_shares: U128::from_field(fields[4])
        }
    }
}

