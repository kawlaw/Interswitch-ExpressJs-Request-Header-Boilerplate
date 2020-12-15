const express = require('express');
const axios = require('axios');
const SHA256 = require('crypto-js/sha256');
const CryptoJS = require('crypto-js');
const n = require('nonce')();
const Utf8 = require('crypto-js/enc-utf8');

// Init App
const app = express();

// Enable BodyParser
app.use(express.json());

// Require dotenv
require('dotenv').config();

app.get('/', (req, res) => {
	// Generate Nonce
	const generatedNonce = n();

	// Generate Timestap in Seconds as required by Interswitch
	const generatedTime = Math.ceil(new Date().getTime() / 1000);

	/*
	 ** @Route      GET (Can be any http method depending on your request)
	 ** @Desc       Get all Billers
	 ** @Access     Requires authentication and authorization
	 ** @Notes      This
	 */
	axios
		.get(`${process.env.INTERSWITCH_SANDBOX_URL}/api/v2/quickteller/billers`, {
			headers: {
				/*
				 ** @Notes: Set Mandatory Security Headers as required by interswitch
				 ** @URI: https://developer.interswitchgroup.com/docs/interswitch-security-headers/#interswitch-security-headers
				 */

				Timestamp: generatedTime,
				Nonce: generatedNonce,
				Authorization: `InterswitchAuth ${CryptoJS.enc.Base64.stringify(
					Utf8.parse(process.env.CLIENT_ID)
				)}`,
				Signature: `${CryptoJS.enc.Base64.stringify(
					SHA256(
						`GET&${process.env.INTERSWITCH_SANDBOX_URL}/api/v2/quickteller/billers/&${generatedTime}&${generatedNonce}&${process.env.CLIENT_ID}&${process.env.CLIENT_SECRET}`
					)
				)}`,
				SignatureMethod: 'SHA256',
				'Content-Type': 'application/json',
			},
		})
		.then((payload) => {
			// 200 Status Response
			console.log(payload);
			res.status(200).json({ msg: 'ok', payload: payload.data });
		})
		.catch((err) => {
			// Posibble 400 or 401 Status Response
			console.log(err.response.data);
			res.status(400).json({ msg: 'Not Okay', err: err.response.data });
		});
});

// Start Server
app.listen(5000, () => {
	console.log(`Server started on Port 5000`);
});
