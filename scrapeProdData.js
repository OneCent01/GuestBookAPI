const https = require('https')
const cheerio = require('cheerio')

const ajax = (method, url, payload=undefined) => new Promise((resolve, reject) => {
	https.get(
		url,
		res => res.on('data', data =>resolve(data.toString('utf8')))
	).on('error', reject)
})

const scrapeUpcDatabase = url => new Promise((resolve, reject) => {
	ajax('GET', url)
	.then(html => {
		const validProps = ['Description', 'Size/Weight', 'Issuing Country']
		const productPage = cheerio.load(html)
		const table_rows = productPage('.data tr')
		const tableData = {}
		Object.keys(table_rows).forEach(row => {
			const tableRow = cheerio.load(table_rows[row])
			const tableCells = tableRow('td')
			const rowData = []
			Object.keys(tableCells).forEach(colIndex => {
				const typedColIndex = +colIndex
				if(!isNaN(typedColIndex)) {
					const currentCell = tableCells[typedColIndex]
					const currentCellVal = cheerio.load(currentCell).text().trim()
					if(currentCellVal && currentCellVal.length) {
						rowData.push(currentCellVal)
					}
				}
			})
			if(
				rowData.length === 2 
				&& validProps.includes(rowData[0])
			) {
				tableData[rowData[0]] = rowData[1]
			}
		})
		resolve(tableData)

	})
	.catch(reject)
})

const scrapeUpcItemDb = url => new Promise((resolve, reject) => {
	ajax('GET', url)
	.then(html => {
		const productPage = cheerio.load(html)
		
		const productData = {}

		const productImg = productPage('.product')[0].attribs.src
		productData.img = productImg
		
		const productRows = productPage('.detail-list tr')
		Object.keys(productRows).forEach(rowIndex => {
			const typedRowIndex = +rowIndex
			if(!isNaN(typedRowIndex)) {
				const row = productRows[typedRowIndex]
				const rowCells = cheerio.load(row).text().split(':').map(s=>s.trim())
				productData[rowCells[0]] = rowCells[1]
			} 
		})
		resolve(productData)
	})
	.catch(reject)
})

const scraperlessPromise = host => new Promise((resolve, reject) => {
	reject({error: `SCRAPER NOT FOR FOR HOST ${host}`})
})

const scrapers = {
	upcdatabase: scrapeUpcDatabase,
	upcitemdb: scrapeUpcItemDb
}

const lookups = [
	'https://www.upcdatabase.com/item/|BARCODE|',
	'https://www.upcitemdb.com/upc/|BARCODE|'
]

const lookupProduct = (barcode, baseUrl) => {
	const url = baseUrl.replace('|BARCODE|', barcode)
	const host = new URL(url).hostname.split('.').slice(1, -1).join('.')
	const scraper = scrapers[host]
	const scaperFound = (scraper && typeof scraper === 'function')
	
	return scaperFound ? scraper(url) : scraperlessPromise(host)
}
const fetchProductData = barcode => Promise.all(lookups.map(lookup => lookupProduct(barcode, lookup)))

module.exports = {
	fetchProductData
}