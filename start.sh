while true; do
	  npm install
	  npm run test
	  node ./index.js
	  git pull
	  echo '[ Auto Restart ] 5 seconds...';
	  sleep 5;
done