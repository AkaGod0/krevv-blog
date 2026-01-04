export async function submitToIndexNow(urls) {
  const key = process.env.INDEXNOW_KEY
  const host = process.env.NEXT_PUBLIC_SITE_URL.replace('https://www.krevv.com', '')

  const payload = {
    host,
    key,
    keyLocation: `https://${host}/${key}.txt`,
    urlList: Array.isArray(urls) ? urls : [urls],
  }

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    return res.status === 200
  } catch (err) {
    console.error('IndexNow Error:', err)
    return false
  }
}
