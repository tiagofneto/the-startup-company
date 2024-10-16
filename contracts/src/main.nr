mod types;

#[aztec]
contract CompanyRegistry {
    use dep::aztec::{prelude::{Map, PublicMutable, AztecAddress}, macros::{storage::storage, functions::{public, view, initializer}}};
    use dep::compressed_string::FieldCompressedString;
    use dep::token::Token;
    use crate::types::{Company, Stream};

    global INITIAL_BALANCE: U128 = U128::from_field(0);

    #[storage]
    struct Storage<Context> {
        // Handle -> Company
        companies: Map<str<31>, PublicMutable<Company, Context>, Context>,
        // Handle -> isTaken
        handles: Map<str<31>, PublicMutable<bool, Context>, Context>,
        // Handle -> email -> Authorized
        authorized: Map<str<31>, Map<str<31>, PublicMutable<bool, Context>, Context>, Context>,

        // Handle -> Balance
        balances: Map<str<31>, PublicMutable<U128, Context>, Context>,
        token_address: PublicMutable<AztecAddress, Context>,

        // UserID -> isVerified
        user_verified: Map<str<31>, PublicMutable<bool, Context>, Context>,

        // StreamID -> Stream
        streams: Map<u64, PublicMutable<Stream, Context>, Context>,
        stream_counter: PublicMutable<u64, Context>,

        // Handle -> UserID -> Shares
        shares: Map<str<31>, Map<str<31>, PublicMutable<U128, Context>, Context>, Context>,
        // Handle -> TotalShares
        total_shares: Map<str<31>, PublicMutable<U128, Context>, Context>,
        // Handle -> MintedShares
        minted_shares: Map<str<31>, PublicMutable<U128, Context>, Context>,
    }

    #[public]
    #[initializer]
    fn constructor(token_address: AztecAddress) {
        storage.token_address.write(token_address);
    }

    #[public]
    fn verify_user(user_id: str<31>) {
        // TODO verify proof and save nullifier
        storage.user_verified.at(user_id).write(true);
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
    fn create_company(name: str<31>, handle: str<31>, description: str<31>, email: str<31>, director: str<31>, total_shares: Field) {
        assert(storage.handles.at(handle).read() == false, "Handle already taken");

        let company = Company {
            name: FieldCompressedString::from_string(name),
            handle: FieldCompressedString::from_string(handle),
            description: FieldCompressedString::from_string(description),
            email: FieldCompressedString::from_string(email),
            director: FieldCompressedString::from_string(director),
            total_shares: U128::from_integer(total_shares)
        };

        storage.companies.at(handle).write(company);
        storage.handles.at(handle).write(true);
        storage.authorized.at(handle).at(email).write(true);

        Token::at(storage.token_address.read()).mint_public(
            context.this_address(),
            INITIAL_BALANCE.to_integer(),
        ).call(&mut context);
        storage.balances.at(handle).write(INITIAL_BALANCE);
    }

    #[public]
    fn authorize_user(handle: str<31>, email: str<31>) {
        storage.authorized.at(handle).at(email).write(true);
    }

    #[public]
    fn create_stream(user_id: str<31>, handle: str<31>, rate: Field, target_address: AztecAddress) {
        let handle_exists = storage.handles.at(handle).read();
        assert(handle_exists, "Company handle does not exist");

        let authorized = storage.authorized.at(handle).at(user_id).read();
        assert(authorized, "User is not authorized");

        let stream = Stream {
            user_id: FieldCompressedString::from_string(user_id),
            company_handle: FieldCompressedString::from_string(handle),
            total_claimed: U128::zero(),
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
        let stream_counter = storage.stream_counter.read();
        assert(id < stream_counter, "Stream does not exist");

        let mut stream = storage.streams.at(id).read();
        let time_diff = U128::from_integer(context.timestamp()) - U128::from_integer(stream.start_date);
        let amount = stream.rate * time_diff - stream.total_claimed;

        let company_balance = storage.balances.at(str<31>::from(stream.company_handle.to_bytes())).read();
        assert(company_balance >= amount, "Insufficient company balance");

        let token_address = storage.token_address.read();
        Token::at(token_address).transfer_public(
            context.this_address(),
            stream.target_address,
            amount.to_integer(),
            0
        ).call(&mut context);
        storage.balances.at(str<31>::from(stream.company_handle.to_bytes())).write(company_balance - amount);

        // TODO check if it's possible to have reference instead of value (no need to rewrite)
        stream.total_claimed = stream.total_claimed + amount;
        storage.streams.at(id).write(stream);

    }

    #[public]
    fn fund_company(handle: str<31>, user_id: str<31>, amount: Field) {
        // assert authorized
        //assert(storage.authorized.at(handle).at(user_id).read(), "User is not authorized");

        let total_shares = storage.total_shares.at(handle).read();
        let minted_shares = storage.minted_shares.at(handle).read();

        let shares_int = U128::from_integer(amount);
        assert(minted_shares + shares_int <= total_shares, "Exceeds total shares");

        let balance = storage.balances.at(handle).read();
        let shares = storage.shares.at(handle).at(user_id).read();
        Token::at(storage.token_address.read()).mint_public(
            context.this_address(),
            amount,
        ).call(&mut context);
        storage.balances.at(handle).write(balance + shares_int);
        storage.shares.at(handle).at(user_id).write(shares + shares_int);
        storage.minted_shares.at(handle).write(minted_shares + shares_int);
    }

    #[public]
    fn issue_shares(handle: str<31>, shares: Field) {
        let total_shares = storage.total_shares.at(handle).read();
        storage.total_shares.at(handle).write(total_shares + U128::from_integer(shares));
    }

    #[public]
    fn get_shares(handle: str<31>) -> (Field, Field) {
        let minted_shares = storage.minted_shares.at(handle).read().to_integer();
        let total_shares = storage.total_shares.at(handle).read().to_integer();
        (minted_shares, total_shares)
    }

    #[public]
    #[view]
    fn is_user_verified(user_id: str<31>) -> bool {
        storage.user_verified.at(user_id).read()
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
