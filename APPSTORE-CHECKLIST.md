# App store upload checklist (needs J's approval at each public step)

1. **GitHub repo:** create `chatbar` (public, AGPL-3.0-or-later). Replace `OWNER` in appinfo/info.xml (website, bugs, repository, screenshots). Push the source and add screenshots/collapsed.png and screenshots/expanded.png.
2. **Certificate signing request:**
   ```
   mkdir -p ~/.nextcloud/certificates && cd ~/.nextcloud/certificates
   openssl req -nodes -newkey rsa:4096 -keyout chatbar.key -out chatbar.csr -subj "/CN=chatbar"
   ```
   Keep chatbar.key private. Open a pull request with chatbar.csr at https://github.com/nextcloud/app-certificate-requests. After it is merged, save the issued certificate as `~/.nextcloud/certificates/chatbar.crt`.
3. **App store account:** sign in at https://apps.nextcloud.com (GitHub login). Use "Register app" with chatbar.crt and the signature of the string `chatbar`:
   `echo -n "chatbar" | openssl dgst -sha512 -sign chatbar.key | openssl base64 -A`
4. **Code signature (optional but recommended):** `occ integrity:sign-app --path=/path/to/chatbar --privateKey=chatbar.key --certificate=chatbar.crt` (creates appinfo/signature.json).
5. **Build:** `make sign` creates build/chatbar-<version>.tar.gz and its .sig.
6. **Release:** create a GitHub release `v<version>` and attach the tarball. The release URL looks like `https://github.com/OWNER/chatbar/releases/download/v1.0.0/chatbar-1.0.0.tar.gz`.
7. **Upload:** at https://apps.nextcloud.com/developer/apps/releases/new, enter the release URL and paste the .sig contents. Check the listing and the screenshots.
