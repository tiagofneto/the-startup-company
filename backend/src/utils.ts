import { Fr } from '@aztec/circuits.js';

export const toString = (value: bigint) => {
    const vals: number[] = Array.from(new Fr(value).toBuffer());
  
    let str = '';
    for (let i = 0; i < vals.length; i++) {
      if (vals[i] != 0) {
        str += String.fromCharCode(Number(vals[i]));
      }
    }
    return str;
};

export function companyFromBigIntObject(rawCompany: any) {
    return {
        name: toString(rawCompany['name']['value']),
        handle: toString(rawCompany['handle']['value']),
        email: toString(rawCompany['email']['value']),
        director: toString(rawCompany['director']['value']),
        // TODO: check how to properly parse this
        totalShares: Number(rawCompany['total_shares']['lo'])
    }
}