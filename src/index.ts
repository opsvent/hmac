import Base64 from 'crypto-js/enc-base64';
import hmacSHA3 from 'crypto-js/hmac-sha3';
import sha3 from 'crypto-js/sha3';
import { nanoid } from 'nanoid';

import * as defaults from './defaults';
import { timestamp, parseSignature } from './utils';

export const TOKEN_TYPE = 'OPSVENT-HMAC-SHA3';

export interface HmacKey {
	id: string;
	key: string;
}

export interface Input {
	method: string;
	url: string;
	body: string;
}

export interface SignInput extends Input {
	nonceLength?: number;
}

export interface VerifyInput extends Input {
	timeWindow?: number;
}

export const sign = (input: SignInput, key: HmacKey): string => {
	const bodyHash = sha3(input.body, { outputLength: 256 }).toString(Base64);
	const ts = timestamp();
	const nonce = nanoid(input.nonceLength ?? defaults.NONCE_LENGTH);

	const toSign = `${input.method}:${input.url}:${bodyHash}:${ts}:${nonce}`;
	const signature = hmacSHA3(toSign, Base64.parse(key.key)).toString(Base64);

	return `${TOKEN_TYPE} ${key.id}:${signature}:${ts}:${nonce}`;
};

export const getKeyIdFromSignature = (signature: string): string => {
	return parseSignature(signature, TOKEN_TYPE).keyId;
};

export const verify = (
	signature: string,
	verify: VerifyInput,
	key: HmacKey
): string => {
	const parsed = parseSignature(signature, TOKEN_TYPE);

	if (parsed.keyId != key.id) {
		throw new Error(
			`Key ID not matching. Expected ${parsed.keyId}, but got ${key.id}`
		);
	}

	if (
		Math.abs(timestamp() - parsed.timestamp) >
		(verify.timeWindow ?? defaults.TIME_WINDOW)
	) {
		throw new Error('Outside of time window');
	}

	const bodyHash = sha3(verify.body, { outputLength: 256 }).toString(Base64);
	const toSign = `${verify.method}:${verify.url}:${bodyHash}:${parsed.timestamp}:${parsed.nonce}`;
	const counterSignature = hmacSHA3(toSign, Base64.parse(key.key)).toString(
		Base64
	);

	if (parsed.signature != counterSignature) {
		throw new Error('Signature missmatch');
	}

	return parsed.nonce;
};

const HMAC = {
	TOKEN_TYPE,
	sign,
	getKeyIdFromSignature,
	verify
};

export default HMAC;
