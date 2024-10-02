use dep::compressed_string::FieldCompressedString;
use dep::protocol_types::traits::{Serialize, Deserialize};
use dep::aztec::prelude::AztecAddress;

#[derive(Serialize, Deserialize)]
pub struct Stream {
    // TODO convert to FieldCompressedString
    company_handle: str<31>,
    total_claimed: U128,
    // Tokens per second
    rate: U128,
    start_date: u64,
    target_address: AztecAddress,
}

#[derive(Serialize, Deserialize)]
pub struct Company {
    name: FieldCompressedString,
    handle: FieldCompressedString,
    email: FieldCompressedString,
    director: FieldCompressedString,
    total_shares: U128
}
