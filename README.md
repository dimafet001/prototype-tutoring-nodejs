This is a website for videocalls through webRTC. I used webRTC, socket.io, NodeJS, Express.

It works in any browser, even on mobile phones.

He is an example of me calling myself from different tabs.
![](live.gif)


If you want to launch it:
	node server.js

Before prod, cd cert -> openssl req -new -newkey rsa:2048 -nodes -out mydomain.csr -keyout private.key -> put keys locations into server.js

If you update the hostname, it will only be secure if:
	- update v3.ext alt_names

openssl req -new -sha256 -nodes -out server.csr -newkey rsa:2048 -keyout server.key -config <( cat server.csr.cnf )

openssl x509 -req -in server.csr -CA rootCA.pem -CAkey rootCA.key -CAcreateserial -out server.crt -days 500 -sha256 -extfile v3.ext
