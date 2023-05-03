export const timestamp = (): number => {
	return Math.floor(Date.now() / 1000);
};

export const parseSignature = (signature: string, type: string) => {
	if (!signature.startsWith(`${type} `)) {
		throw new Error(`Unknown signature type. Requiring ${type}`);
	}

	const data = signature.slice(type.length + 1).split(':');

	if (data.length != 4) {
		throw new Error(
			`Malformed signature. Valid signatures contain 4 segment, this only contains ${data.length} segments`
		);
	}

	return {
		keyId: data[0],
		signature: data[1],
		timestamp: parseInt(data[2]),
		nonce: data[3]
	};
};
