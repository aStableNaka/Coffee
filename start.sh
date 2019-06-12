while true; do
      node ./index.js
      git pull
      echo 'Restarting coffee in 5 seconds...';
      sleep 5;
done