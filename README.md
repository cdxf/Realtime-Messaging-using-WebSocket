# PTUDW-DACK
Nhóm PTUDW-DACK

Cài đặt:
- Trên localhost, không ssl:
+ Cho client vào HTTP Server bất kỳ (Apache,nginx...);
+ Chạy node server/server.js để khởi động server.

- Trên host, có ssl:
+ Trong file server/sever.js:
	+ isHTTPS = true;

	+ firebase.initializeApp({
    databaseURL: "firebaseURL của bạn",
    serviceAccount: "file Json chứa serviceAccount của bạn"
	}); 
	Chỉnh sao cho phù hợp.

    - var options = {
        key: fs.readFileSync('privkey.pem'),
        cert: fs.readFileSync('cert.pem'),
        ca: fs.readFileSync('chain.pem')
    };
	Copy các cert vào và chỉnh cho phù hợp
	
+ Trong file client/js/global.js:
	- SOCKET_URL: Chỉnh cho phù hợp.