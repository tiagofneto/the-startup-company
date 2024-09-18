mod types;

contract CompanyRegistry {
    use dep::aztec::prelude::{Map, PublicMutable};
    use dep::compressed_string::FieldCompressedString;
    use crate::types::Company;

    #[aztec(storage)]
    struct Storage {
        // Handle -> Company
        companies: Map<str<31>, PublicMutable<Company>>,
        // Handle -> isTaken
        handles: Map<str<31>, PublicMutable<bool>>,
    }

    #[aztec(public)]
    fn create_company(name: str<31>, handle: str<31>, email: str<31>, director: str<31>, total_shares: Field) {
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

    #[aztec(public)]
    #[aztec(view)]
    fn get_company(handle: str<31>) -> Company {
        storage.companies.at(handle).read()
    }

    #[aztec(public)]
    #[aztec(view)]
    fn is_handle_taken(handle: str<31>) -> bool {
        storage.handles.at(handle).read()
    }
}
