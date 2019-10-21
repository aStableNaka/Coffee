while true; do
	  npm run test
	  node ./index.js
	  echo '[ Auto Restart ] 2 seconds...';
	  sleep 2;
done