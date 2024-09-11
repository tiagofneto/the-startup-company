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
    fn create_company(name: FieldCompressedString, email: FieldCompressedString, director: FieldCompressedString, total_shares: U128) {
        let id = storage.company_count.read().add(U128::from_integer(1));

        let company = Company {
            name: name,
            email: email,
            director: director,
            total_shares: total_shares
        };

        storage.companies.at(id).write(company);
        storage.company_count.write(id);
    }
}
