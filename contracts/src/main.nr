mod types;

#[aztec]
contract CompanyRegistry {
    use dep::aztec::{prelude::{Map, PublicMutable, AztecAddress}, macros::{storage::storage, functions::{public, view, initializer}}};
    use dep::compressed_string::FieldCompressedString;
    use dep::token::Token;
    use crate::types::Company;

    global INITIAL_BALANCE: U128 = U128::from_field(100);

    #[storage]
    struct Storage<Context> {
        // Handle -> Company
        companies: Map<str<31>, PublicMutable<Company, Context>, Context>,
        // Handle -> isTaken
        handles: Map<str<31>, PublicMutable<bool, Context>, Context>,
        balances: Map<str<31>, PublicMutable<U128, Context>, Context>,
        token_address: PublicMutable<AztecAddress, Context>,
    }

    #[public]
    #[initializer]
    fn constructor(token_address: AztecAddress) {
        storage.token_address.write(token_address);
    }

    #[public]
    fn transfer_tokens_to_handle(from: str<31>, to: str<31>, amount: Field) {
        let balance = storage.balances.at(from).read();
        let amount_int = U128::from_integer(amount);
        assert(balance >= amount_int, "Insufficient balance");

        let handle_exists = storage.handles.at(to).read();
        assert(handle_exists, "Receiver handle does not exist");

        storage.balances.at(from).write(balance - amount_int);

        let to_balance = storage.balances.at(to).read();
        storage.balances.at(to).write(to_balance + amount_int);
    }

    #[public]
    fn transfer_tokens_to_address(from: str<31>, to: AztecAddress, amount: Field) {
        let balance = storage.balances.at(from).read();
        let amount_int = U128::from_integer(amount);
        assert(balance >= amount_int, "Insufficient balance");

        storage.balances.at(from).write(balance - amount_int);

        let token_address = storage.token_address.read();
        Token::at(token_address).transfer_public(
            context.this_address(),
            to,
            amount,
            0
        ).call(&mut context);
    }

    #[public]
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

        Token::at(storage.token_address.read()).mint_public(
            context.this_address(),
            INITIAL_BALANCE.to_integer(),
        ).call(&mut context);
        storage.balances.at(handle).write(INITIAL_BALANCE);
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

    #[public]
    #[view]
    fn get_balance(handle: str<31>) -> U128 {
        storage.balances.at(handle).read()
    }

}
