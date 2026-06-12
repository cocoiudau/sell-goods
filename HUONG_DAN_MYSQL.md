# Ket noi dang ky/dang nhap voi MySQL

## 1. Tao database

Mo MySQL Workbench, phpMyAdmin, hoac terminal MySQL, sau do chay file:

```sql
server/schema.sql
```

File nay tao database `freshcart_db` va bang `customers`.

## 2. Tao file cau hinh

Sao chep `.env.example` thanh `.env`, roi sua thong tin MySQL cua may ban:

```env
PORT=3000
JWT_SECRET=doi_chuoi_bi_mat_nay
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=mat_khau_mysql_cua_ban
DB_NAME=freshcart_db
```

## 3. Cai thu vien va chay server

```bash
npm install
npm start
```

Neu dung PowerShell tren Windows va gap loi `npm.ps1 cannot be loaded`, hay dung:

```bash
npm.cmd install
npm.cmd start
```

Khi chay server, hay de terminal do mo. Neu dong terminal thi API dang ky/dang nhap cung tat.

Khi thanh cong, server chay tai:

```text
http://localhost:3000
```

## 4. Mo website

Ban co the mo bang Live Server nhu hien tai:

```text
http://127.0.0.1:5500/index.html
```

Hoac mo truc tiep qua Node server:

```text
http://localhost:3000/
```

## Cach hoat dong

- Dang ky se luu thong tin khach hang vao bang `customers`.
- Mat khau duoc ma hoa bang `bcryptjs`, khong luu mat khau goc.
- Dang nhap thanh cong se luu token va thong tin khach hang vao `localStorage`.
- Lan sau mo website, neu token con hop le, website tu nhan dien khach hang da dang nhap.
- Nut Logout se xoa phien dang nhap khoi trinh duyet.

## Neu deploy backend len Railway

Trang GitHub Pages trong `js/app.js` dang goi:

```text
https://sell-goods-production.up.railway.app/api
```

Neu `/api/health` chay duoc nhung dang ky bao loi database, hay kiem tra:

1. Railway project da co MySQL service chua.
2. Backend service da duoc ket noi voi MySQL service chua.
3. Trong Railway Variables co cac bien MySQL nhu `MYSQL_URL` hoac `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`.
4. Da tao bang `customers` tren database Railway chua. Can chay noi dung file `server/schema.sql` tren database Railway.
5. Sau khi sua `server/server.js`, can redeploy Railway. Kiem tra:

```text
https://sell-goods-production.up.railway.app/api/db-health
```

Neu tra ve `{"ok":true,"database":"connected"}` thi dang ky moi luu duoc vao MySQL.
