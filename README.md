# @opsvent/hmac

[![NPM](https://img.shields.io/npm/v/@opsvent/hmac)](https://www.npmjs.com/package/@opsvent/hmac)
[![Build Status](https://ci.systest.eu/api/badges/opsvent/hmac/status.svg)](https://ci.systest.eu/opsvent/hmac)
[![Typescript](https://img.shields.io/npm/types/@opsvent/hmac)](https://www.npmjs.com/package/@opsvent/hmac)
[![License](https://img.shields.io/github/license/paymoapp/node-active-window)](https://www.gnu.org/licenses/gpl-3.0.txt)

Feature complete, easy to use signing and signature verification for all of your secure API request needs. It works both in browsers and in Node.JS.

### Usage

- Import the library
- Generate some shared keys (see in `demo/index.ts`)
- Before sending the request, sign it using the sign function, and attach the signature in a header (preferred is [Authorization](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization))
- When receiving the request, extract the key ID to fetch the shared key from your DB
- Verify the signature
- Verify the returned nonce in your cache DB to check against replay attacks.
- Learn more about HMAC: https://www.okta.com/identity-101/hmac/
- See a complete demo in `demo/index.ts`

### Details

- Token type: `OPSVENT-HMAC-SHA3`
- Uses SHA3 hashes
- What is signed: `<method>:<url>:<body sha3-256>:<timestamp>:<nonce>`
- Signature form: `OPSVENT-HMAC-SHA3 <key id>:<signature>:<timestamp>:<nonce>`
- Timestamp is Unix timestamp
- Nonce: [nanoid](https://www.npmjs.com/package/nanoid)(10) - collision resistance: 1% collision chance in 4 days when generating 500 IDs per second (good enough, but you can increase it)

### Recommandations

- Allowed timestamp difference should be < 5 minutes.
- You should store the nonces for 10 minutes (in this case) to verify against them.
- You should increase nonce length if using larger windows, or if you want extra collision resistance.
- 256 bit key Base64 encoded (see `demo/index.ts` for generating it)
- When running the verify function, you MUST check the returned nonce in your local DB

### API

###### `sign(input: SignInput, key: HmacKey): string`

Create a signature using the given input and key. The returned string can be directly passed to the Authorization header.

###### `getKeyIdFromSignature(signature: string): string`

Returns the ID of the key used to create the signature. It throws if signature is not a valid signature.

###### `verify(signature: string, verify: VerifyInput, key: HmacKey): string`

Checks if a signature is valid. If it is invalid, it will throw an error. If everything is alright, it will return the nonce of the signature. You MUST verify this nonce in your local storage to check against replay attacks.

###### `Input`

```ts
interface Input {
	method: string; // The HTTP request method (ex: GET, POST, etc)
	url: string; // The complete URL of the request
	body: string; // The body of the request in string form
}
```

###### `SignInput`

```ts
interface SignInput extends Input {
	nonceLength?: number; // The length of the generated nonce. Default is 10
}
```

###### `VerifyInput`

```ts
interface VerifyInput extends Input {
	timeWindow?: number; // The allowed time window in which the signature is accepted
}
```

###### `HmacKey`

```ts
interface HmacKey {
	id: string; // Arbitrary ID, you can choose it to fit your application's needs
	key: string; // Base64 encoded key
}
```
