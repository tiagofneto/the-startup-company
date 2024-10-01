mod types;

#[aztec]
contract CompanyRegistry {
    use dep::aztec::{prelude::{Map, PublicMutable}, macros::{storage::storage, functions::{public, view}}};
    use dep::compressed_string::FieldCompressedString;
    use crate::types::Company;

    #[storage]
    struct Storage<Context> {
        // Handle -> Company
        companies: Map<str<31>, PublicMutable<Company, Context>, Context>,
        // Handle -> isTaken
        handles: Map<str<31>, PublicMutable<bool, Context>, Context>,
    }

    #[public]
    fn create_company(name: str<31>, handle: str<31>, email: str<31>, director: str<31>, total_shares: Field) {
        let handles = storage.handles;
        assert(storage.handles.at(handle).read() == false, "Handle already taken");

        let company = Company {
            name: FieldCompressedString::from_string(name),
            handle: FieldCompressedString::from_string(handle),
            email: FieldCompressedString::from_string(email),
            director: FieldCompressedString::from_string(director),
            total_shares: U128::from_integer(total_shares)
        };

        storage.companies.at(handle).write(company);
        storage.handles.at(handle).write(true);
    }

    #[public]
    #[view]
    fn get_company(handle: str<31>) -> Company {
        storage.companies.at(handle).read()
    }

    #[public]
    #[view]
    fn is_handle_taken(handle: str<31>) -> bool {
        storage.handles.at(handle).read()
    }
}
