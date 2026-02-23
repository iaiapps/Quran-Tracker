const fs = require('fs');

let pages = [];

async function fetchPage(i) {
  try {
    const response = await fetch(`https://api.alquran.cloud/v1/page/${i}`);
    const data = await response.json();
    
    if (data.status === 'OK') {
      const ayahs = data.data.ayahs;
      const firstAyah = ayahs[0];
      const lastAyah = ayahs[ayahs.length - 1];
      
      return {
        pageNumber: i,
        startSurah: firstAyah.surah.number,
        startAyah: firstAyah.numberInSurah,
        endSurah: lastAyah.surah.number,
        endAyah: lastAyah.numberInSurah
      };
    }
  } catch (error) {
    console.error(`Error fetching page ${i}:`, error.message);
  }
  return null;
}

async function fetchAllPages() {
  // First load existing data
  try {
    pages = JSON.parse(fs.readFileSync('page-boundaries.json'));
    console.log(`Loaded ${pages.length} existing pages`);
  } catch (e) {
    console.log('Starting fresh');
  }
  
  const existingNumbers = new Set(pages.map(p => p.pageNumber));
  
  for (let i = 1; i <= 604; i++) {
    if (!existingNumbers.has(i)) {
      const result = await fetchPage(i);
      if (result) {
        pages.push(result);
        if (pages.length % 50 === 0) {
          console.log(`Fetched ${pages.length}/604 pages`);
          fs.writeFileSync('page-boundaries.json', JSON.stringify(pages, null, 2));
        }
      }
      // Small delay to be nice to the API
      await new Promise(r => setTimeout(r, 50));
    }
  }
  
  // Sort by page number
  pages.sort((a, b) => a.pageNumber - b.pageNumber);
  
  fs.writeFileSync('page-boundaries.json', JSON.stringify(pages, null, 2));
  console.log(`Done! Total pages: ${pages.length}`);
}

fetchAllPages();
