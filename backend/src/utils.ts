import { Fr } from '@aztec/circuits.js';
import nodemailer from 'nodemailer';
import axios from 'axios';
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
    description: toString(rawCompany['description']['value'])
  };
}

export const transport = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS
  }
});

export const isFaceValidHelper = async (img: string) => {
  // TODO env
  const url = `http://127.0.0.1:5000/is-face-valid`;
  const response = await axios.post(url, { img });
  console.log(response.data)
  return response.data.verified;
}