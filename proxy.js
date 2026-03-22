// proxy.js — NMC Verification Proxy
// Deploy to Railway or Render — reads PORT from environment automatically

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Allow requests from any origin (so your frontend HTML can call this)
app.use(cors());

// Health check — Railway/Render ping this to confirm the server is alive
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'NMC Verify Proxy' });
});

// Main verification endpoint
// Usage: GET /api/nmc-verify?regNo=146631
app.get('/api/nmc-verify', async (req, res) => {
  const { regNo } = req.query;
  if (!regNo) return res.status(400).json({ error: 'regNo query param is required' });

  const nmcUrl =
    `https://www.nmc.org.in/MCIRest/open/getPaginatedData?service=getPaginatedDoctor` +
    `&draw=1` +
    `&columns%5B0%5D%5Bdata%5D=0&columns%5B0%5D%5Bsearchable%5D=true&columns%5B0%5D%5Borderable%5D=true&columns%5B0%5D%5Bsearch%5D%5Bregex%5D=false` +
    `&columns%5B1%5D%5Bdata%5D=1&columns%5B1%5D%5Bsearchable%5D=true&columns%5B1%5D%5Borderable%5D=true&columns%5B1%5D%5Bsearch%5D%5Bregex%5D=false` +
    `&columns%5B2%5D%5Bdata%5D=2&columns%5B2%5D%5Bsearchable%5D=true&columns%5B2%5D%5Borderable%5D=true&columns%5B2%5D%5Bsearch%5D%5Bregex%5D=false` +
    `&columns%5B3%5D%5Bdata%5D=3&columns%5B3%5D%5Bsearchable%5D=true&columns%5B3%5D%5Borderable%5D=true&columns%5B3%5D%5Bsearch%5D%5Bregex%5D=false` +
    `&columns%5B4%5D%5Bdata%5D=4&columns%5B4%5D%5Bsearchable%5D=true&columns%5B4%5D%5Borderable%5D=true&columns%5B4%5D%5Bsearch%5D%5Bregex%5D=false` +
    `&columns%5B5%5D%5Bdata%5D=5&columns%5B5%5D%5Bsearchable%5D=true&columns%5B5%5D%5Borderable%5D=true&columns%5B5%5D%5Bsearch%5D%5Bregex%5D=false` +
    `&columns%5B6%5D%5Bdata%5D=6&columns%5B6%5D%5Bsearchable%5D=true&columns%5B6%5D%5Borderable%5D=true&columns%5B6%5D%5Bsearch%5D%5Bregex%5D=false` +
    `&order%5B0%5D%5Bcolumn%5D=0&order%5B0%5D%5Bdir%5D=asc` +
    `&start=0&length=500` +
    `&search%5Bvalue%5D=&search%5Bregex%5D=false` +
    `&name=&registrationNo=${encodeURIComponent(regNo)}&smcId=&year=&_=${Date.now()}`;

  try {
    const response = await fetch(nmcUrl, {
      headers: {
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.nmc.org.in/information-desk/indian-medical-register/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest',
      }
    });

    if (!response.ok) {
      return res.status(502).json({ error: `NMC server returned ${response.status}` });
    }

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error('NMC fetch error:', err.message);
    res.status(500).json({ error: 'Failed to reach NMC server', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ NMC Proxy running on port ${PORT}`);
  console.log(`   Test: http://localhost:${PORT}/api/nmc-verify?regNo=146631`);
});
