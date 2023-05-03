import crypto from 'crypto';

import hmac from '../dist';

const request = {
	method: 'POST',
	url: 'https://www.example.com/api/test',
	body: JSON.stringify({
		someKey: 'someValue',
		otherKey: 123,
		anotherKey: [1, 2, 3, 4, 5]
	})
};

const key = {
	id: 'KID',
	key: crypto.randomBytes(32).toString('base64')
};

console.log('Request:', request);
console.log('Shared key:', key);
console.log('\n\n');

const signature = hmac.sign(request, key);
console.log('Signature:', signature);
console.log('\n\n');

const keyId = hmac.getKeyIdFromSignature(signature);
console.log('Extracted Key ID:', keyId);
try {
	const verify = hmac.verify(signature, request, key);
	console.log('Verification passed. Check nonce:', verify);
} catch (e) {
	console.log('Verification failed. Message:', e);
}
