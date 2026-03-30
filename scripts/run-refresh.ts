import { refreshMarketData } from '../lib/snapshots';

refreshMarketData()
  .then((result) => {
    console.log('Refresh complete', result);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
