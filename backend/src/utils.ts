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
        name: toString(rawCompany['0']),
        handle: toString(rawCompany['1']),
        email: toString(rawCompany['2']),
        director: toString(rawCompany['3']),
        totalShares: Number(rawCompany['4'])
    }
}