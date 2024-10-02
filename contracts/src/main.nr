mod types;

#[aztec]
contract CompanyRegistry {
    use dep::aztec::{prelude::{Map, PublicMutable, AztecAddress}, macros::{storage::storage, functions::{public, view, initializer}}};
    use dep::compressed_string::FieldCompressedString;
    use dep::token::Token;
    use crate::types::{Company, Stream};

    global INITIAL_BALANCE: U128 = U128::from_field(100);

    #[storage]
    struct Storage<Context> {
        // Handle -> Company
        companies: Map<str<31>, PublicMutable<Company, Context>, Context>,
        // Handle -> isTaken
        handles: Map<str<31>, PublicMutable<bool, Context>, Context>,

        balances: Map<str<31>, PublicMutable<U128, Context>, Context>,
        token_address: PublicMutable<AztecAddress, Context>,

        // StreamID -> Stream
        streams: Map<u64, PublicMutable<Stream, Context>, Context>,
        stream_counter: PublicMutable<u64, Context>,
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
    fn create_stream(handle: str<31>, rate: Field, target_address: AztecAddress) {
        let stream = Stream {
            company_handle: handle,
            total_claimed: U128::from_integer(0),
            rate: U128::from_integer(rate),
            start_date: context.timestamp(),
            target_address: target_address,
        };

        let id = storage.stream_counter.read();
        storage.streams.at(id).write(stream);
        storage.stream_counter.write(id + 1);
    }

    #[public]
    fn claim_stream(id: u64) {
        let mut stream = storage.streams.at(id).read();
        let time_diff = U128::from_integer(context.timestamp()) - U128::from_integer(stream.start_date);
        let amount = stream.rate * time_diff - stream.total_claimed;

        let company_balance = storage.balances.at(stream.company_handle).read();
        assert(company_balance >= amount, "Insufficient company balance");

        let token_address = storage.token_address.read();
        Token::at(token_address).transfer_public(
            context.this_address(),
            stream.target_address,
            amount.to_integer(),
            0
        ).call(&mut context);
        storage.balances.at(stream.company_handle).write(company_balance - amount);

        // TODO check if it's possible to have reference instead of value (no need to rewrite)
        stream.total_claimed = stream.total_claimed + amount;
        storage.streams.at(id).write(stream);

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
    fn get_balance(handle: str<31>) -> Field {
        storage.balances.at(handle).read().to_integer()
    }

}
