mod types;

contract CompanyRegistry {
    use dep::aztec::prelude::{Map, PublicMutable};
    use dep::compressed_string::FieldCompressedString;
    use crate::types::Company;

    #[aztec(storage)]
    struct Storage {
        companies: Map<U128, PublicMutable<Company>>,
        company_count: PublicMutable<U128>
    }

    #[aztec(public)]
    fn create_company(name: str<31>, email: str<31>, director: str<31>, total_shares: Field) {
        let id = storage.company_count.read().add(U128::from_integer(1));

        let company = Company {
            name: FieldCompressedString::from_string(name),
            email: FieldCompressedString::from_string(email),
            director: FieldCompressedString::from_string(director),
            total_shares: U128::from_integer(total_shares)
        };

        storage.companies.at(id).write(company);
        storage.company_count.write(id);
    }
}
