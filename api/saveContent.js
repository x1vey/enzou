export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const pat = process.env.GITHUB_PAT;
  if (!pat) {
    return res.status(500).json({ error: 'Server missing GITHUB_PAT environment variable. Cannot securely push to repository.' });
  }

  const data = req.body;
  if (!data) {
    return res.status(400).json({ error: 'Missing content data in request body' });
  }

  const REPO = 'x1vey/enzou';
  const FILE_PATH = 'content.json';
  const API_URL = `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`;

  try {
    // 1. Get current file SHA (required for update)
    const getRes = await fetch(API_URL, {
      headers: {
        'Authorization': `token ${pat}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!getRes.ok) throw new Error('Failed to fetch file info. Ensure PAT has repo access and GITHUB_PAT is set in Vercel.');
    const getJson = await getRes.json();
    const sha = getJson.sha;

    // 2. Prepare payload
    const contentStr = JSON.stringify(data, null, 2);
    // Use Buffer for base64 encoding in Node.js instead of btoa
    const contentBase64 = Buffer.from(contentStr).toString('base64');

    const body = {
      message: 'Update site content via CMS Admin Panel',
      content: contentBase64,
      sha: sha,
      branch: 'main'
    };

    // 3. Put updated file
    const putRes = await fetch(API_URL, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${pat}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (putRes.ok) {
      return res.status(200).json({ success: true, message: 'Content pushed to GitHub successfully.' });
    } else {
      const errRes = await putRes.json();
      return res.status(500).json({ error: 'Failed to push to GitHub API', details: errRes });
    }
  } catch (error) {
    console.error('GitHub API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error while connecting to GitHub' });
  }
}
