<!-- Student name -->

Raymond(謝懷緯)

<!-- HTTPS DOMAIN MAIN url -->
https://www.raymond0116.xyz/
<!-- Build Node.js Project for Web Server -->

http://3.22.212.77/

<!-- Run Web Server in the Background -->

利用 pm2 維持程式持續在背景被執行 1.安裝個 pm2。
npm install pm2 -g

2.到專案資料夾，用 pm2 啟動專案。
pm2 start app.js
pm2 start ./bin/www
pm2 start npm — name “<example_process_name>” — start

3.讓伺服器重啟時 pm2 就會自動跑，可以執行：
pm2 startup

4.把 pm2 存檔讓它下次重啟時知道要做什麼：
pm2 save

5.確認 pm2 狀態報告，可以執行：
pm2 status
pm2 list

ref:https://medium.com/wenchin-rolls-around/%E5%9C%A8-aws-ec2-%E4%B8%8A%E9%83%A8%E7%BD%B2-node-js-%E6%87%89%E7%94%A8%E7%A8%8B%E5%BC%8F-cdc9ce9ef18c
